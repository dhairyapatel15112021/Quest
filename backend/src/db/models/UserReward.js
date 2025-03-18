const mongoose = require("mongoose");

const UserRewardSchema = new mongoose.Schema({
    fk_user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    fk_challenge_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge",
        required: true
    },
    fk_reward_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChallengeReward",
        required: true
    },
    claimed: { 
        type: Boolean, 
        default: false 
    },
    claimed_date: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("UserReward", UserRewardSchema);
