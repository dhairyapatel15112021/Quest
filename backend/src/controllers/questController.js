const Quest = require("../db/models/Quest");
const questSchema = require("../validation/questSchema");
const UserQuest = require('../db/models/UserQuest');
const UserVideo = require('../db/models/UserVideo');
const UserReward = require('../db/models/UserReward');
const Challenge = require('../db/models/Challenge');
const mongoose = require('mongoose');

const questCreateController = async (req, res) => {
    try {
        const { end_date, ...data } = req.body;
        const processData = end_date && end_date.trim() !== "" ? { ...req.body } : { ...data };
        const result = questSchema.safeParse({
            ...processData,
            total_budget : Number(req.body.total_budget)
        });
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.errors.map(err => err.message)
            });
        }
        
        const existingQuest = await Quest.findOne({ Title: result.data.Title });
        if (existingQuest) {
            return res.status(403).json({ success: false, message: "Quest with this title already exists" });
        }

        
        const newQuest = new Quest({
            ...req.body,
            create_by : req.user.id,
            quest_image: req.file ? req.file.buffer : null
        });
        
        const storedQuest = await newQuest.save();
        res.status(201).json({ success: true, message: "Quest created successfully", quest: storedQuest });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error", errors: err.message });
    }
}

const getQuestController = async (req, res) => {
    try {
        const allQuests = await Quest.find().lean();
        // When documents are queried, they are returned as Mongoose Documents by default. With the Mongoose lean() method, the documents are returned as plain objects.
        
        const enhancedQuests = await Promise.all(allQuests.map(async (quest) => {
            // Get total participants
            const totalParticipants = await UserQuest.countDocuments({
                fk_quest_id: quest._id
            });

            const questChallenges = await Challenge.find({
                fk_quest_id: quest._id
            }); 

            const challengeIds = questChallenges.map(challenge => challenge._id);

            // Updated video metrics aggregation to correctly count likes and shares
            const videoMetrics = await UserVideo.aggregate([
                {
                    $match: {
                        fk_challenge_id: { $in: challengeIds },
                        $or: [
                            { isLiked: true },
                            { isShared: true }
                        ]
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalLikes: { 
                            $sum: { 
                                $cond: [{ $eq: ["$isLiked", true] }, 1, 0] 
                            } 
                        },
                        totalShares: { 
                            $sum: { 
                                $cond: [{ $eq: ["$isShared", true] }, 1, 0] 
                            } 
                        }
                    }
                }
            ]);

            // Get total rewards distributed
           

            // Convert quest_image buffer to base64 if it exists
            const questData = { ...quest };
            if (questData.quest_image) {
                questData.quest_image = questData.quest_image.toString('base64');
            }

            return {
                ...questData,
                analytics: {
                    totalParticipants,
                    totalLikedVideos: videoMetrics[0]?.totalLikes || 0,
                    totalSharedVideos: videoMetrics[0]?.totalShares || 0,
                    isActive: quest.is_Active === "active"
                }
            };
        }));

        const totalRewardsDistributed = await UserReward.aggregate([
            {
                $match: { claimed: true } // Only include claimed rewards
            },
            {
                $lookup: {
                    from: "ChallengeReward", // Joining with ChallengeReward collection
                    localField: "fk_reward_id",
                    foreignField: "_id",
                    as: "rewardDetails"
                }
            },
            {
                $unwind: "$rewardDetails" // Flatten reward details
            },
            {
                $group: {
                    _id: null,
                    totalClaimedRewards: { $sum: 1 }, // Count all claimed rewards
                    totalPointsDistributed: {
                        $sum: {
                            $cond: {
                                if: { $eq: ["$rewardDetails.reward_type", "coupons"] },
                                then: { $ifNull: ["$rewardDetails.points", 0] },
                                else: 0
                            }
                        }
                    }
                }
            }
        ]);

        // Calculate overall statistics
        const overallStats = {
            totalActiveQuests: enhancedQuests.filter(quest => quest.is_Active === "active").length,
            totalParticipants: enhancedQuests.reduce((sum, quest) => sum + quest.analytics.totalParticipants, 0),
            totalLikedVideos: enhancedQuests.reduce((sum, quest) => sum + quest.analytics.totalLikedVideos, 0),
            totalSharedVideos: enhancedQuests.reduce((sum, quest) => sum + quest.analytics.totalSharedVideos, 0),
            totalRewardsDistributed: totalRewardsDistributed[0]?.totalPointsDistributed || 0
        };

        res.status(200).json({ 
            success: true, 
            quests: enhancedQuests,
            overallStats
        });
    }
    catch (err) {
        console.error('Error in getQuestController:', err);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: err.message 
        });
    }
}

const updateQuestActiveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const quest = await Quest.findById(id);
        if (!quest) {
            return res.status(404).json({ message: "Quest not found" });
        }
        if(quest.is_Active === "completed"){
            return res.status(401).json({ message: "Quest Is Completed,Can Not Do Changes" });
        }

        const currentDate = new Date();
        const endDate = quest.end_date ? new Date(quest.end_date) : null;

        if (endDate && endDate < currentDate) {
            return res.status(400).json({ message: "Quest has already ended" });
        }
        
        quest.is_Active = (quest.is_Active === "created" ? "active" : "created");
        await quest.save();

        res.status(200).json({ message: `Quest ${quest.is_Active === "created" ? 'Unpublished' : 'Published'} Successfully`, quest });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

const getActiveQuests = async (req, res) => {
    try {
        const currentDate = new Date();
        const userId = req.user.id; // Get the current user's ID

        // First get active quests
        const activeQuests = await Quest.find({
            is_Active: "active",
            $or: [
                { end_date: { $gt: currentDate } },
                { end_date: null } 
            ]
        }).select({
            Title: 1,
            Description: 1,
            start_date: 1,
            end_date: 1,
            quest_image: 1
        }).lean().sort({ start_date: -1 });

        // Get enhanced quest information with participant count and user status
        const enhancedQuests = await Promise.all(activeQuests.map(async (quest) => {
            // Get total participants for this quest
            const totalParticipants = await UserQuest.countDocuments({
                fk_quest_id: quest._id
            });

            // Get user's status for this quest
            const userQuestStatus = await UserQuest.findOne({
                fk_quest_id: quest._id,
                fk_user_id: userId
            }).select('status').lean();

            // Convert quest image to base64
            const questObj = { ...quest };
            if (questObj.quest_image) {
                questObj.quest_image = questObj.quest_image.toString('base64');
            }

            return {
                ...questObj,
                totalParticipants,
                userQuestStatus: userQuestStatus?.status || null
            };
        }));

        return res.status(200).json({
            message: "Active quests fetched successfully",
            quests: enhancedQuests
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateQuest = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Handle the end_date field
        const end_date = req.body.end_date === "" ? null : req.body.end_date;
        
        // Validate the request data
        const result = questSchema.safeParse({
            Title: req.body.Title,
            Description: req.body.Description,
            total_budget: Number(req.body.total_budget),
            start_date: req.body.start_date,
            end_date: end_date
        });
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.errors.map(err => err.message)
            });
        }

        // Find the existing quest
        const existingQuest = await Quest.findById(id);
        if (!existingQuest) {
            return res.status(404).json({ 
                success: false, 
                message: "Quest not found" 
            });
        }

        // Check if quest is completed
        if (existingQuest.is_Active === "completed") {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot update a completed quest" 
            });
        }

        // Check if new title conflicts with other quests (excluding current quest)
        const titleConflict = await Quest.findOne({ 
            Title: req.body.Title,
            _id: { $ne: id }
        });
        if (titleConflict) {
            return res.status(400).json({ 
                success: false, 
                message: "Quest with this title already exists" 
            });
        }

        // Prepare update data
        const updateData = {
            Title: req.body.Title,
            Description: req.body.Description,
            total_budget: Number(req.body.total_budget),
            start_date: req.body.start_date,
            end_date: end_date,
            quest_image: req.file ? req.file.buffer : existingQuest.quest_image
        };

        // Update the quest
        const updatedQuest = await Quest.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        // Convert quest_image buffer to base64 for response
        const questResponse = updatedQuest.toObject();
        if (questResponse.quest_image) {
            questResponse.quest_image = questResponse.quest_image.toString('base64');
        }

        res.status(200).json({ 
            success: true, 
            message: "Quest updated successfully", 
            quest: questResponse
        });
    }
    catch (err) {
        console.error('Error in updateQuest:', err);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            errors: err.message 
        });
    }
}

const completeQuest = async (req, res) => {
    try {
        const { questId } = req.params;
        const userId = req.user.id;
        if(!mongoose.Types.ObjectId.isValid(questId)){
            return res.status(400).json({ success: false, message: "Invalid quest ID" });
        }
        const userQuest = await UserQuest.findOne({ fk_quest_id: questId, fk_user_id: userId });
        if(!userQuest){
            return res.status(404).json({ success: false, message: "User quest not found" });
        }
        if(userQuest.status === "Completed"){
            return res.status(400).json({ success: false, message: "Quest already completed" });
        }
        userQuest.status = "Completed";
        await userQuest.save();
        res.status(200).json({ success: true, message: "Quest marked as completed successfully" });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error", errors: err.message });
    }
}
module.exports = {
    questCreate: questCreateController,
    getQuest: getQuestController,
    changeQuestActiveStatus : updateQuestActiveStatus,
    getActiveQuests : getActiveQuests,
    updateQuest : updateQuest,
    completeQuest : completeQuest
}