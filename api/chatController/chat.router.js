const express = require("express");
const router = express.Router();
const { protectedRoute } = require("../../middlewares/auth");
const {
  sendMessage,
  getChatHistory,
  getChatList,
  getUnreadCount,
  checkChatEligibility
} = require("./chat.controller");

// Send message
router.post("/sendMessage", protectedRoute, sendMessage);

// Get chat history with specific user
router.get("/history/:otherUserId", protectedRoute, getChatHistory);

// Get all chat conversations
router.get("/list", protectedRoute, getChatList);

// Get unread message count
router.get("/unreadCount", protectedRoute, getUnreadCount);

// Check if user can initiate chat
router.get("/checkEligibility/:receiverId", protectedRoute, checkChatEligibility);

module.exports = router;
