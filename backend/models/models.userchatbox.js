const mongoose = require("mongoose");

const userChatboxSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true,
        enum: ["user"]
    },
    text: {
        type: String,
        required: true
    },
    timstamp: {
        type: Date,
        default: Date.now
    }
});

// Model name: "UserChatbox" -> collection "userchatboxes"
const UserChatbox = mongoose.model('UserChatbox', userChatboxSchema, "userchatbox");

module.exports = UserChatbox;
