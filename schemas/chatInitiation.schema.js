const mongoose = require("mongoose");

// Track first-time chat initiations for credit deduction
const chatInitiationSchema = new mongoose.Schema({
  initiator_id: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User',
  },
  receiver_id: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User',
  },
  creditDeducted: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Compound index to ensure unique chat initiation tracking
chatInitiationSchema.index({ initiator_id: 1, receiver_id: 1 }, { unique: true });

const ChatInitiation = mongoose.model("chat_initiations", chatInitiationSchema);
module.exports = ChatInitiation;
