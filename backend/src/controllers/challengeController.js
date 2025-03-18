const mongoose = require("mongoose");
const Challenge = require("../db/models/Challenge");
const Quest = require("../db/models/Quest");
const ChallengeReward = require("../db/models/ChallengeReward");
const challengeSchema = require("../validation/challangeSchema");
const { challengeRewardArraySchema } = require("../validation/challangeRewardSchema");
const TotalRewardExpenses = require("../service/TotalRewardExpenses");
const UserQuest = require("../db/models/UserQuest");
const UserChallenge = require('../db/models/UserChallenge');
const UserReward = require('../db/models/UserReward');
const User = require('../db/models/User');

const ChallengeCreate = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const { challenge, reward } = req.body;

        // Validate Challenge Data
        const challengeValidation = challengeSchema.safeParse({
            ...challenge,
            share_video_count: Number(challenge.share_video_count),
            like_video_count: Number(challenge.like_video_count)
        });

        if (!challengeValidation.success) {
            return res.status(400).json({ message: "Invalid challenge data", errors: challengeValidation.error.errors });
        }

        const rewardValidation = challengeRewardArraySchema.safeParse(reward);
        if (!rewardValidation.success) {
            return res.status(400).json({ message: "Invalid reward data", errors: rewardValidation.error.errors });
        }

        const quest = await Quest.findOne({ _id: challenge.fk_quest_id }).session(session);
        if (!quest) {
            return res.status(404).json({ message: "Quest not found" });
        }

        if (quest.is_Active === "completed" || quest.is_Active === "active") {
            return res.status(400).json({ message: "Quest is already active or completed. Challenge cannot be created." });
        }

        const rewardExpense = await TotalRewardExpenses(challenge.fk_quest_id);
        
        if (quest.total_budget < reward.filter(item => item.reward_type === "coupons").reduce((acc, item) => acc + item.points, 0) + rewardExpense) {
            return res.status(400).json({ message: "Insufficient budget for this challenge reward" });
        }

        const savedChallenge = new Challenge({
            fk_quest_id: challenge.fk_quest_id,
            like_video_count: challenge.like_video_count,
            share_video_count: challenge.share_video_count,
            Title: challenge.Title
        });

        await savedChallenge.save({ session });

        const rewardsToSave = reward.map(item => ({
            ...item,
            fk_challenge_id: savedChallenge._id
        }));

        await ChallengeReward.insertMany(rewardsToSave, { session });

        await session.commitTransaction();

        return res.status(201).json({ message: "Challenge and rewards created successfully", challenge: savedChallenge });
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({ message: "Server error", error: error.message });
    }
    finally {
        session.endSession();
    }
};

const getChallenges = async (req, res) => {
    try {
        const { quest_id } = req.query;

        const query = {};
        if (quest_id) {
            if (!mongoose.Types.ObjectId.isValid(quest_id)) {
                return res.status(400).json({ message: "Invalid quest ID format" });
            }
            query.fk_quest_id = new mongoose.Types.ObjectId(quest_id);
        }

        // First get total number of challenges in the quest
        const totalChallenges = await Challenge.countDocuments(query);

        // If there are no challenges, return early
        if (totalChallenges === 0) {
            return res.status(200).json({
                message: "No challenges found for this quest",
                challenges: [],
                questStats: {
                    totalChallenges: 0,
                    totalParticipants: 0,
                    fullyCompletedUsers: 0,
                    halfCompletedUsers: 0
                }
            });
        }

        const challenges = await Challenge.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "Quest",
                    localField: "fk_quest_id",
                    foreignField: "_id",
                    as: "quest"
                }
            },
            {
                $unwind: "$quest"
            },
            {
                $lookup: {
                    from: "ChallengeReward",
                    localField: "_id",
                    foreignField: "fk_challenge_id",
                    as: "rewards"
                }
            },
            {
                $lookup: {
                    from: "UserChallenge",
                    localField: "_id",
                    foreignField: "fk_challenge_id",
                    as: "userChallenges"
                }
            },
            {
                $project: {
                    _id: 1,
                    like_video_count: 1,
                    share_video_count: 1,
                    Title: 1,
                    quest: {
                        _id: 1,
                        Title: 1,
                        Description: 1,
                        start_date: 1,
                        end_date: 1,
                        total_budget: 1,
                        is_Active: 1
                    },
                    rewards: 1,
                    userChallenges: 1
                }
            }
        ]);

        // Calculate completion statistics with safe division
        const userCompletionStats = await UserQuest.aggregate([
            {
                $match: {
                    fk_quest_id: new mongoose.Types.ObjectId(quest_id)
                }
            },
            {
                $lookup: {
                    from: "UserChallenge",
                    let: { user_id: "$fk_user_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$fk_user_id", "$$user_id"] },
                                        { $eq: ["$completed", true] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "completedChallenges"
                }
            },
            {
                $addFields: {
                    completedChallengesCount: { $size: "$completedChallenges" },
                    completionPercentage: {
                        $multiply: [
                            {
                                $cond: [
                                    { $eq: [totalChallenges, 0] },
                                    0,
                                    {
                                        $multiply: [
                                            { $divide: [{ $size: "$completedChallenges" }, totalChallenges] },
                                            100
                                        ]
                                    }
                                ]
                            },
                            1
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    fullyCompletedUsers: {
                        $sum: {
                            $cond: [{ $gte: ["$completionPercentage", 100] }, 1, 0]
                        }
                    },
                    halfCompletedUsers: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$completionPercentage", 50] },
                                        { $lt: ["$completionPercentage", 100] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalUsers: 1,
                    fullyCompletedUsers: 1,
                    halfCompletedUsers: 1,
                    fullyCompletedPercentage: {
                        $cond: [
                            { $eq: ["$totalUsers", 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ["$fullyCompletedUsers", "$totalUsers"] },
                                    100
                                ]
                            }
                        ]
                    },
                    halfCompletedPercentage: {
                        $cond: [
                            { $eq: ["$totalUsers", 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ["$halfCompletedUsers", "$totalUsers"] },
                                    100
                                ]
                            }
                        ]
                    }
                }
            }
        ]);

        const completionStats = userCompletionStats[0] || {
            totalUsers: 0,
            fullyCompletedUsers: 0,
            halfCompletedUsers: 0,
            fullyCompletedPercentage: 0,
            halfCompletedPercentage: 0
        };

        return res.status(200).json({
            success: true,
            message: "Challenges fetched successfully",
            data: {
                challenges: challenges,
                questStats: {
                    totalChallenges,
                    totalParticipants: completionStats.totalUsers,
                    fullyCompletedUsers: completionStats.fullyCompletedUsers,
                    fullyCompletedPercentage: completionStats.fullyCompletedPercentage,
                    halfCompletedUsers: completionStats.halfCompletedUsers,
                    halfCompletedPercentage: completionStats.halfCompletedPercentage
                }
            }
        });
    } catch (error) {
        console.error('Error in getChallenges:', error);
        return res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: error.message 
        });
    }
};

const enrollChallenge = async (req, res) => {
    // Start a new session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { questId } = req.params;
        const userId = req.user.id;
        
        if(!mongoose.Types.ObjectId.isValid(questId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quest ID format"
            });
        }

        const isQuestCompleted = await Quest.findById(new mongoose.Types.ObjectId(questId)).is_Active === "completed";
        if(isQuestCompleted) {
            return res.status(400).json({
                success: false,
                message: "Quest is already completed. Challenge cannot be enrolled."
            });
        }

        // Check if user is already enrolled in this quest
        const existingUserQuest = await UserQuest.findOne({
            fk_quest_id: new mongoose.Types.ObjectId(questId),
            fk_user_id: new mongoose.Types.ObjectId(userId)
        }).session(session);

        if (existingUserQuest) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "You are already enrolled in this quest"
            });
        }

        // Get all challenges for this quest
        const questChallenges = await Challenge.find({
            fk_quest_id: new mongoose.Types.ObjectId(questId)
        }).session(session);

        if (!questChallenges.length) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "No challenges found for this quest"
            });
        }

        // Create UserQuest record
        const userQuest = new UserQuest({
            fk_quest_id: new mongoose.Types.ObjectId(questId),
            fk_user_id: new mongoose.Types.ObjectId(userId),
            status: "In Progress",
        });

        await userQuest.save({ session });

        // Create UserChallenge records for each challenge
        const userChallenges = await Promise.all(questChallenges.map(async (challenge) => {
            const userChallenge = new UserChallenge({
                fk_challenge_id: new mongoose.Types.ObjectId(challenge._id),
                fk_user_id: new mongoose.Types.ObjectId(userId),
            });
            await userChallenge.save({ session });
            return {
                challengeId: challenge._id,
            };
        }));

        // Commit the transaction
        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: "Successfully enrolled in quest",
        });
    } catch (error) {
        // If an error occurs, abort the transaction
        await session.abortTransaction();
        console.error('Error in enrollChallenge:', error);
        res.status(500).json({
            success: false,
            message: "Failed to enroll in quest",
            error: error.message
        });
    } finally {
        // End the session
        session.endSession();
    }
};

const getUserQuestDetails = async (req, res) => {
    try {
        const { questId } = req.query;
        const userId = req.user.id;
       
        if (!mongoose.Types.ObjectId.isValid(questId)) {
            return res.status(400).json({ 
                success: false,
                message: "Quest ID is required" 
            });
        }

        // Check user enrollment status
        const userQuest = await UserQuest.findOne({
            fk_quest_id: new mongoose.Types.ObjectId(questId),
            fk_user_id: new mongoose.Types.ObjectId(userId)
        });

        if (!userQuest) {
            return res.status(404).json({ 
                success: false,
                message: "You are not enrolled in this quest",
                isEnrolled: false
            });
        }

        // Get quest details and challenge count
        const questData = await Quest.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(questId)
                }
            },
            {
                $lookup: {
                    from: "Challenge",
                    localField: "_id",
                    foreignField: "fk_quest_id",
                    as: "challenges"
                }
            },
            {
                $project: {
                    Title: 1,
                    quest_image: 1,
                    end_date: 1,
                    totalChallenges: { $size: "$challenges" },
                    challengeIds: "$challenges._id",
                    daysLeft: {
                        $cond: [
                            { $eq: ["$end_date", null] },
                            null,
                            {
                                $ceil: {
                                    $divide: [
                                        { $subtract: ["$end_date", new Date()] },
                                        1000 * 60 * 60 * 24 // Convert milliseconds to days
                                    ]
                                }
                            }
                        ]
                    }
                }
            }
        ]);

        if (!questData.length) {
            return res.status(404).json({ 
                success: false,
                message: "Quest not found" 
            });
        }

        const quest = questData[0];

        // Convert quest image to base64 if it exists
        if (quest.quest_image) {
            quest.quest_image = quest.quest_image.toString('base64');
        }

        // Get completed challenges count
        const completedChallengesCount = await UserChallenge.countDocuments({
            fk_challenge_id: { $in: quest.challengeIds },
            fk_user_id: new mongoose.Types.ObjectId(userId),
            completed: true
        });

        return res.status(200).json({
            success: true,
            message: "Quest details fetched successfully",
            data: {
                questTitle: quest.Title,
                questImage: quest.quest_image,
                daysLeft: quest.daysLeft,
                isCompleted: userQuest.status === "Completed",
                progress: {
                    totalChallenges: quest.totalChallenges,
                    completedChallenges: completedChallengesCount
                }
            }
        });
    } catch (error) {
        console.error("Error fetching quest details:", error);
        return res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: error.message 
        });
    }
};

const getUserChallengeDetails = async (req, res) => {
    try {
        const { questId } = req.query;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(questId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quest ID format"
            });
        }

        // First check if user is enrolled in this quest
        const userQuest = await UserQuest.findOne({
            fk_quest_id: new mongoose.Types.ObjectId(questId),
            fk_user_id: new mongoose.Types.ObjectId(userId)
        });

        if (!userQuest) {
            return res.status(404).json({
                success: false,
                message: "You are not enrolled in this quest"
            });
        }

        // Get challenges with rewards and user completion status
        const challenges = await Challenge.aggregate([
            {
                $match: {
                    fk_quest_id: new mongoose.Types.ObjectId(questId)
                }
            },
            // Get rewards for each challenge
            {
                $lookup: {
                    from: "ChallengeReward",
                    localField: "_id",
                    foreignField: "fk_challenge_id",
                    as: "rewards"
                }
            },
            // Get user's completion status for each challenge
            {
                $lookup: {
                    from: "UserChallenge",
                    let: { challengeId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$fk_challenge_id", "$$challengeId"] },
                                        { $eq: ["$fk_user_id", new mongoose.Types.ObjectId(userId)] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "userChallenge"
                }
            },
            {
                $project: {
                    _id: 1,
                    Title: 1,
                    like_video_count: 1,
                    share_video_count: 1,
                    rewards: {
                        $map: {
                            input: "$rewards",
                            as: "reward",
                            in: {
                                reward_type: "$$reward.reward_type",
                                points: "$$reward.points",
                                active_duration_days: "$$reward.active_duration_days"
                            }
                        }
                    },
                    isCompleted: {
                        $cond: {
                            if: { $gt: [{ $size: "$userChallenge" }, 0] },
                            then: { $arrayElemAt: ["$userChallenge.completed", 0] },
                            else: false
                        }
                    }
                }
            },
            {
                $sort: { _id: 1 } // Consistent ordering
            }
        ]);

        if (!challenges.length) {
            return res.status(404).json({
                success: false,
                message: "No challenges found for this quest"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Challenges fetched successfully",
            isCompleted: userQuest.status === "Completed",
            data: challenges
        });

    } catch (error) {
        console.error("Error fetching challenge details:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const getQuestLeaderboard = async (req, res) => {
    try {
        const { questId } = req.query;

        if (!mongoose.Types.ObjectId.isValid(questId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quest ID format"
            });
        }

        // Get total enrolled users and their rewards
        const leaderboardData = await UserQuest.aggregate([
            {
                $match: {
                    fk_quest_id: new mongoose.Types.ObjectId(questId),
                }
            },
            // Lookup user details
            {
                $lookup: {
                    from: "User",
                    localField: "fk_user_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            // Get all challenges for this quest
            {
                $lookup: {
                    from: "Challenge",
                    let: { quest_id: "$fk_quest_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$fk_quest_id", "$$quest_id"] }
                            }
                        }
                    ],
                    as: "challenges"
                }
            },
            // Get user rewards for these challenges
            {
                $lookup: {
                    from: "UserReward",
                    let: { 
                        user_id: "$fk_user_id",
                        challenge_ids: "$challenges._id"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$fk_user_id", "$$user_id"] },
                                        { $in: ["$fk_challenge_id", "$$challenge_ids"] }
                                    ]
                                }
                            }
                        },
                        // Join with ChallengeReward to get reward details
                        {
                            $lookup: {
                                from: "ChallengeReward",
                                localField: "fk_reward_id",
                                foreignField: "_id",
                                as: "reward_details"
                            }
                        },
                        {
                            $unwind: "$reward_details"
                        }
                    ],
                    as: "userRewards"
                }
            },
            // Group by user to combine rewards
            {
                $group: {
                    _id: "$user._id",
                    firstname: { $first: "$user.firstname" },
                    lastname: { $first: "$user.lastname" },
                    userRewards: { $push: "$userRewards" }
                }
            },
            // Calculate totals
            {
                $project: {
                    _id: 1,
                    firstname: 1,
                    lastname: 1,
                    rewards: {
                        points: {
                            $sum: {
                                $map: {
                                    input: {
                                        $reduce: {
                                            input: "$userRewards",
                                            initialValue: [],
                                            in: { $concatArrays: ["$$value", "$$this"] }
                                        }
                                    },
                                    as: "reward",
                                    in: { 
                                        $cond: [
                                            { $eq: ["$$reward.reward_details.reward_type", "coupons"] },
                                            { $ifNull: ["$$reward.reward_details.points", 0] },
                                            0
                                        ]
                                    }
                                }
                            }
                        },
                        freeCoffee: {
                            $size: {
                                $filter: {
                                    input: {
                                        $reduce: {
                                            input: "$userRewards",
                                            initialValue: [],
                                            in: { $concatArrays: ["$$value", "$$this"] }
                                        }
                                    },
                                    as: "reward",
                                    cond: { $eq: ["$$reward.reward_details.reward_type", "free coffee"] }
                                }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    "rewards.coupons.description": {
                        $concat: [
                            { $toString: "$rewards.freeCoffee" },
                            " Free Coffee Coupon",
                            { $cond: [{ $gt: ["$rewards.freeCoffee", 1] }, "s", ""] }
                        ]
                    }
                }
            },
            {
                $sort: { "rewards.points": -1 }
            }
        ]);

        // Get total enrolled users count
        const totalEnrolledUsers = await UserQuest.countDocuments({
            fk_quest_id: new mongoose.Types.ObjectId(questId),
        });

        return res.status(200).json({
            success: true,
            message: "Leaderboard fetched successfully",
            data: {
                totalEnrolledUsers,
                leaderboard: leaderboardData
            }
        });

    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const getQuestParticipantsDetails = async (req, res) => {
    try {
        const { questId } = req.query;
        
        if (!mongoose.Types.ObjectId.isValid(questId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quest ID format"
            });
        }

        // Get all participants and their rewards
        const participantsData = await UserQuest.aggregate([
            {
                $match: {
                    fk_quest_id: new mongoose.Types.ObjectId(questId)
                }
            },
            // Lookup user details
            {
                $lookup: {
                    from: "User",
                    localField: "fk_user_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            // First get all challenges for this quest
            {
                $lookup: {
                    from: "Challenge",
                    let: { questId: "$fk_quest_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$fk_quest_id", "$$questId"] }
                            }
                        }
                    ],
                    as: "questChallenges"
                }
            },
            // For each challenge, get the user's completion status
            {
                $lookup: {
                    from: "UserChallenge",
                    let: { 
                        userId: "$fk_user_id",
                        challengeIds: "$questChallenges._id"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$fk_user_id", "$$userId"] },
                                        { $in: ["$fk_challenge_id", "$$challengeIds"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "userChallenges"
                }
            },
            // Get user rewards for this quest
            {
                $lookup: {
                    from: "UserReward",
                    let: { 
                        userId: "$fk_user_id",
                        challengeIds: "$questChallenges._id"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$fk_user_id", "$$userId"] },
                                        { $in: ["$fk_challenge_id", "$$challengeIds"] }
                                    ]
                                }
                            }
                        },
                        // Join with ChallengeReward to get reward details
                        {
                            $lookup: {
                                from: "ChallengeReward",
                                localField: "fk_reward_id",
                                foreignField: "_id",
                                as: "reward_details"
                            }
                        },
                        {
                            $unwind: "$reward_details"
                        }
                    ],
                    as: "rewards"
                }
            },
            // Group by user to combine rewards
            {
                $group: {
                    _id: "$user._id",
                    firstname: { $first: "$user.firstname" },
                    lastname: { $first: "$user.lastname" },
                    questChallenges: { $first: "$questChallenges" },
                    userChallenges: { $first: "$userChallenges" },
                    allRewards: { $push: "$rewards" }
                }
            },
            // Project the required fields
            {
                $project: {
                    _id: 1,
                    firstname: 1,
                    lastname: 1,
                    challenges: {
                        $map: {
                            input: "$questChallenges",
                            as: "challenge",
                            in: {
                                _id: "$$challenge._id",
                                title: "$$challenge.Title",
                                isCompleted: {
                                    $let: {
                                        vars: {
                                            userChallenge: {
                                                $filter: {
                                                    input: "$userChallenges",
                                                    as: "uc",
                                                    cond: { $eq: ["$$uc.fk_challenge_id", "$$challenge._id"] }
                                                }
                                            }
                                        },
                                        in: {
                                            $cond: [
                                                { $gt: [{ $size: "$$userChallenge" }, 0] },
                                                { $arrayElemAt: ["$$userChallenge.completed", 0] },
                                                false
                                            ]
                                        }
                                    }
                                },
                                like_video_count: {
                                    $let: {
                                        vars: {
                                            userChallenge: {
                                                $filter: {
                                                    input: "$userChallenges",
                                                    as: "uc",
                                                    cond: { $eq: ["$$uc.fk_challenge_id", "$$challenge._id"] }
                                                }
                                            }
                                        },
                                        in: {
                                            $ifNull: [
                                                { $arrayElemAt: ["$$userChallenge.like_video_count", 0] },
                                                0
                                            ]
                                        }
                                    }
                                },
                                share_video_count: {
                                    $let: {
                                        vars: {
                                            userChallenge: {
                                                $filter: {
                                                    input: "$userChallenges",
                                                    as: "uc",
                                                    cond: { $eq: ["$$uc.fk_challenge_id", "$$challenge._id"] }
                                                }
                                            }
                                        },
                                        in: {
                                            $ifNull: [
                                                { $arrayElemAt: ["$$userChallenge.share_video_count", 0] },
                                                0
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    rewards: {
                        points: {
                            $sum: {
                                $map: {
                                    input: {
                                        $filter: {
                                            input: {
                                                $reduce: {
                                                    input: "$allRewards",
                                                    initialValue: [],
                                                    in: { $concatArrays: ["$$value", "$$this"] }
                                                }
                                            },
                                            as: "reward",
                                            cond: { $eq: ["$$reward.reward_details.reward_type", "coupons"] }
                                        }
                                    },
                                    as: "reward",
                                    in: { 
                                        $cond: [
                                            { $ifNull: ["$$reward.reward_details.points", false] },
                                            "$$reward.reward_details.points",
                                            0
                                        ]
                                    }
                                }
                            }
                        },
                        freeCoffee: {
                            $size: {
                                $filter: {
                                    input: {
                                        $reduce: {
                                            input: "$allRewards",
                                            initialValue: [],
                                            in: { $concatArrays: ["$$value", "$$this"] }
                                        }
                                    },
                                    as: "reward",
                                    cond: { $eq: ["$$reward.reward_details.reward_type", "free coffee"] }
                                }
                            }
                        }
                    }
                }
            },
            // Sort by points in descending order
            {
                $sort: {
                    "rewards.points": -1
                }
            }
        ]);

        // Get total number of participants
        const totalParticipants = await UserQuest.countDocuments({ fk_quest_id: new mongoose.Types.ObjectId(questId) });

        return res.status(200).json({
            success: true,
            message: "Quest participants details retrieved successfully",
            data: {
                totalParticipants,
                participants: participantsData
            }
        });

    } catch (error) {
        console.error("Error in getQuestParticipantsDetails:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    createChallenge: ChallengeCreate,
    getChallenges: getChallenges,
    enrollChallenge: enrollChallenge,
    getUserQuestDetails: getUserQuestDetails,
    getUserChallengeDetails: getUserChallengeDetails,
    getQuestLeaderboard : getQuestLeaderboard,
    getQuestParticipantsDetails : getQuestParticipantsDetails
};
