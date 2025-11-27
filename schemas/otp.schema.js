const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    "otp": Number,
    "phoneNumber":String,
    "countryCode":String,
    "heartsId": Number,
    "isOTPVerified":Boolean
});

const otp = mongoose.model("otpVerifier", otpSchema);
module.exports = otp;
