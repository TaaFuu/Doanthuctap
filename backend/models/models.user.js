const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
const generate = require("../helpers/generate");

mongoose.plugin(slug);

const UserSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        tokenUser: {
            type: String,
            default: () => generate.generateRandomString(20)
        },
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date
    }, {
    timestamps: true
});
const Users = mongoose.model('Users', UserSchema, "user");

module.exports = Users;