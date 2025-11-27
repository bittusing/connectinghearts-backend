const mongoose = require("mongoose");

const interestSchema = new mongoose.Schema({
  timeStamp: {
    type: Date,
    default: Date.now,
  },
  requester_id: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  receiver_id: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User',
  },
  status: {
    type: String,
    required: true,
  }
});

const Interest = mongoose.model("interests_summary", interestSchema);
module.exports = Interest;
