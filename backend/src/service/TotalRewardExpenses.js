const ChallengeReward = require("../db/models/ChallengeReward");
const mongoose = require("mongoose");

const TotalRewardExpenses = async (fk_quest_id) => {
    try {
   
        const result = await ChallengeReward.aggregate([
            {
                $lookup: {
                    from: "Challenge",
                    localField: "fk_challenge_id",
                    foreignField: "_id",
                    as: "challenge"
                }
            },
            {
                $unwind: "$challenge"
            },
            {
                $match: {
                    "challenge.fk_quest_id": new mongoose.Types.ObjectId(fk_quest_id),
                    "reward_type": "coupons"
                }
            },
            {
                $group: {
                    _id: null,
                    totalPoints: { $sum: "$points" }
                }
            }
        ]);
        
        return result.length > 0 ? result[0].totalPoints : 0;
    } catch (error) {
        console.error("Error in aggregation:", error);
        return 0;
    }
};

module.exports = TotalRewardExpenses;
