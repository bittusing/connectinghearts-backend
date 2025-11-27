const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema({
    "membershipAmount":Number,
    "duration":Number,
    "currency":String,
    "planName":String,
    "heartCoins":String
});

const member = mongoose.model("membership_Plan", membershipSchema);
module.exports = member;
