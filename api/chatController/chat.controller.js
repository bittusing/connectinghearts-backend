const chatService = require("./chat.service");
const userSchema = require("../../schemas/user.schema");

module.exports = {
  // Send message (called when user sends first message)
  sendMessage: async (req, res) => {
    try {
      const { receiverId, message, messageType = 'text' } = req.body;
      const senderId = req.userId;

      if (!receiverId || !message) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          message: "receiverId and message are required"
        });
      }

      // Check if receiver exists
      const receiver = await userSchema.findById(receiverId);
      if (!receiver) {
        return res.status(404).send({
          code: "CH404",
          status: "failed",
          message: "Receiver not found"
        });
      }

      // Check if this is first-time chat initiation
      const hasInitiated = await chatService.hasInitiatedChat(senderId, receiverId);
      
      let creditInfo = {
        creditDeducted: false,
        message: "Chat already initiated"
      };

      // If first time, deduct credit
      if (!hasInitiated) {
        try {
          creditInfo = await chatService.initiateChat(senderId, receiverId);
        } catch (error) {
          return res.status(400).send({
            code: "CH400",
            status: "failed",
            message: error.message
          });
        }
      }

      // Save message (will be sent via socket in real-time)
      const savedMessage = await chatService.saveMessage(senderId, receiverId, message, messageType);

      return res.send({
        code: "CH200",
        status: "success",
        message: "Message sent successfully",
        data: {
          messageId: savedMessage._id,
          creditDeducted: creditInfo.creditDeducted,
          creditMessage: creditInfo.message
        }
      });
    } catch (error) {
      console.error('Send message error:', error);
      return res.status(500).send({
        code: "CH500",
        status: "failed",
        message: error.message || "Failed to send message"
      });
    }
  },

  // Get chat history with a specific user
  getChatHistory: async (req, res) => {
    try {
      const { otherUserId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const userId = req.userId;

      if (!otherUserId) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          message: "otherUserId is required"
        });
      }

      const chatHistory = await chatService.getChatHistory(
        userId,
        otherUserId,
        parseInt(page),
        parseInt(limit)
      );

      // Mark messages as read
      await chatService.markAsRead(otherUserId, userId);

      return res.send({
        code: "CH200",
        status: "success",
        message: "Chat history fetched successfully",
        data: chatHistory
      });
    } catch (error) {
      console.error('Get chat history error:', error);
      return res.status(500).send({
        code: "CH500",
        status: "failed",
        message: error.message || "Failed to fetch chat history"
      });
    }
  },

  // Get all chat conversations
  getChatList: async (req, res) => {
    try {
      const userId = req.userId;
      const chatList = await chatService.getChatList(userId);

      return res.send({
        code: "CH200",
        status: "success",
        message: "Chat list fetched successfully",
        data: chatList
      });
    } catch (error) {
      console.error('Get chat list error:', error);
      return res.status(500).send({
        code: "CH500",
        status: "failed",
        message: error.message || "Failed to fetch chat list"
      });
    }
  },

  // Get unread message count
  getUnreadCount: async (req, res) => {
    try {
      const userId = req.userId;
      const count = await chatService.getUnreadCount(userId);

      return res.send({
        code: "CH200",
        status: "success",
        message: "Unread count fetched successfully",
        data: { unreadCount: count }
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      return res.status(500).send({
        code: "CH500",
        status: "failed",
        message: error.message || "Failed to fetch unread count"
      });
    }
  },

  // Check if user can initiate chat (has credits)
  checkChatEligibility: async (req, res) => {
    try {
      const { receiverId } = req.params;
      const senderId = req.userId;

      // Check if already initiated
      const hasInitiated = await chatService.hasInitiatedChat(senderId, receiverId);
      
      if (hasInitiated) {
        return res.send({
          code: "CH200",
          status: "success",
          message: "Chat already initiated",
          data: {
            canChat: true,
            creditRequired: false,
            alreadyInitiated: true
          }
        });
      }

      // Check credits and membership
      const user = await userSchema.findById(senderId).select('heartCoins memberShipExpiryDate');
      const isMembershipActive = new Date().getTime() < new Date(user.memberShipExpiryDate).getTime();

      if (!isMembershipActive) {
        return res.send({
          code: "CH200",
          status: "success",
          message: "Membership expired",
          data: {
            canChat: false,
            creditRequired: true,
            reason: "membership_expired"
          }
        });
      }

      if (user.heartCoins <= 0) {
        return res.send({
          code: "CH200",
          status: "success",
          message: "Insufficient credits",
          data: {
            canChat: false,
            creditRequired: true,
            reason: "insufficient_credits"
          }
        });
      }

      return res.send({
        code: "CH200",
        status: "success",
        message: "Can initiate chat",
        data: {
          canChat: true,
          creditRequired: true,
          availableCredits: user.heartCoins
        }
      });
    } catch (error) {
      console.error('Check chat eligibility error:', error);
      return res.status(500).send({
        code: "CH500",
        status: "failed",
        message: error.message || "Failed to check chat eligibility"
      });
    }
  }
};
