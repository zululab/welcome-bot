const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userId: Number,
    name: String,
    userName: String,
    user_clicked_option: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
},{versionKey: false})

module.exports = mongoose.model("user", userSchema);