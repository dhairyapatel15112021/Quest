const mongoose = require("mongoose");

const UserQuestSchema = new mongoose.Schema({
    fk_user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    fk_quest_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Quest", 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["In Progress", "Completed"], 
        required: true,
        default: "In Progress"
    }
}, { timestamps: true });

module.exports = mongoose.model("UserQuest", UserQuestSchema);
