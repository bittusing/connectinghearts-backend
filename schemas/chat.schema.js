const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User',
  },
  receiver_id: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User',
  },
  message: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ sender_id: 1, receiver_id: 1, createdAt: -1 });
chatSchema.index({ receiver_id: 1, isRead: 1 });

const Chat = mongoose.model("chats", chatSchema);
module.exports = Chat;
