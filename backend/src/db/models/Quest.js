const mongoose = require("mongoose");

mongoose.pluralize(null);

const QuestSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
    },
    create_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    total_budget: {
        type: Number,
        required: true
    },
    quest_image: {
        type: Buffer 
    },
    is_Active: {
        type: String,
        enum: ["created", "active", "completed"],
        default: "created"
    }
}, { timestamps: true });

module.exports = mongoose.model("Quest", QuestSchema);
