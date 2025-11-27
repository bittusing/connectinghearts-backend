const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  srcmIdNumber: {
    type: String,
    required: true,
  },
  satsangCentreName: {
    type: String,
    required: true,
  },
  preceptorsName: {
    type: String,
    required: true,
  },
  preceptorsContactNumber: {
    type: Number,
    required: true,
  },
  preceptorsEmail: {
    type: String,
    required: true,
  },
  clientID: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  srcmIdFilename:{
    type: String,
    required:true
  }
});

const User = mongoose.model("srcmDetails", userSchema);
module.exports = User;
