const mongoose = require("mongoose");

mongoose.pluralize(null);

const ChallengeRewardSchema = new mongoose.Schema({
    fk_challenge_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge",
        required: true
    },
    reward_type: {
        type: String,
        required: true
    },
    points: {
        type: Number
    },
    active_duration_days: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("ChallengeReward", ChallengeRewardSchema);
