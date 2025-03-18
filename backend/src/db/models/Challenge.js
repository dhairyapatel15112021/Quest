const mongoose = require("mongoose");

mongoose.pluralize(null);

const ChallengeSchema = new mongoose.Schema({
    like_video_count: {
        type: Number,
        default: 0
    },
    share_video_count: {
        type: Number,
        default: 0
    },
    Title:{
        type: String,
        required: true,
        unique: true
    },
    fk_quest_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quest",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Challenge", ChallengeSchema);
