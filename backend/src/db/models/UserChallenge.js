const mongoose = require("mongoose");

const UserChallengeSchema = new mongoose.Schema({
    fk_challenge_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Challenge", 
        required: true 
    },
    fk_user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    completed: { 
        type: Boolean, 
        default: false 
    },
    start_date: {
        type: Date,
        required: true,
        default: Date.now
    },
    completion_date: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("UserChallenge", UserChallengeSchema);
