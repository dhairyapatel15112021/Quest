const mongoose = require("mongoose");

mongoose.pluralize(null);

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    wallet: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
