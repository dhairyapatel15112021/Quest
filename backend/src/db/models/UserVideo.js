const mongoose = require("mongoose");

const UserVideoSchema = new mongoose.Schema({
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
    video_filename: { 
        type: String, 
        required: true 
    }, // Filename or video URL
    isLiked: { 
        type: Boolean, 
        default: false 
    }, // True if user liked the video
    isShared: { 
        type: Boolean, 
        default: false 
    }, // True if user shared the video
}, { timestamps: true });

module.exports = mongoose.model("UserVideo", UserVideoSchema);
