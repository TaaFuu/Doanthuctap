const mongoose = require("mongoose");

const botSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    timstamp: {
        type: Date,
        default: Date.now
    }
});

// Model name: "Bot" -> collection "bot"
const Bot = mongoose.model('Bot', botSchema, "bot");

module.exports = Bot;
