const chatSchema = require("../../schemas/chat.schema");
const chatInitiationSchema = require("../../schemas/chatInitiation.schema");
const userSchema = require("../../schemas/user.schema");
const mongoose = require("mongoose");

module.exports = {
  // Check if user has already initiated chat with receiver
  hasInitiatedChat: async (initiatorId, receiverId) => {
    try {
      const initiation = await chatInitiationSchema.findOne({
        initiator_id: initiatorId,
        receiver_id: receiverId
      });
      return !!initiation;
    } catch (error) {
      throw error;
    }
  },

  // Deduct credit and mark chat as initiated
  initiateChat: async (initiatorId, receiverId) => {
    try {
      // Check if already initiated
      const alreadyInitiated = await module.exports.hasInitiatedChat(initiatorId, receiverId);
      
      if (alreadyInitiated) {
        return {
          success: true,
          creditDeducted: false,
          message: "Chat already initiated. No credit deducted."
        };
      }

      // Check if user has enough credits
      const user = await userSchema.findById(initiatorId).select('heartCoins memberShipExpiryDate');
      
      if (!user) {
        throw new Error("User not found");
      }

      // Check if membership is active and has credits
      const isMembershipActive = new Date().getTime() < new Date(user.memberShipExpiryDate).getTime();
      
      if (!isMembershipActive) {
        throw new Error("Membership expired. Please renew to chat.");
      }

      if (user.heartCoins <= 0) {
        throw new Error("Insufficient credits. Please purchase more credits to chat.");
      }

      // Deduct 1 credit
      await userSchema.findByIdAndUpdate(initiatorId, {
        $inc: { heartCoins: -1 }
      });

      // Mark chat as initiated
      await chatInitiationSchema.create({
        initiator_id: initiatorId,
        receiver_id: receiverId,
        creditDeducted: true
      });

      return {
        success: true,
        creditDeducted: true,
        message: "1 credit deducted. Chat initiated successfully."
      };
    } catch (error) {
      throw error;
    }
  },

  // Save message to database
  saveMessage: async (senderId, receiverId, message, messageType = 'text') => {
    try {
      const newMessage = await chatSchema.create({
        sender_id: senderId,
        receiver_id: receiverId,
        message: message,
        messageType: messageType,
        isDelivered: false,
        isRead: false
      });

      return newMessage;
    } catch (error) {
      throw error;
    }
  },

  // Get chat history between two users
  getChatHistory: async (userId, otherUserId, page = 1, limit = 50) => {
    try {
      const skip = (page - 1) * limit;

      const messages = await chatSchema.find({
        $or: [
          { sender_id: userId, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: userId }
        ]
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const totalMessages = await chatSchema.countDocuments({
        $or: [
          { sender_id: userId, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: userId }
        ]
      });

      return {
        messages: messages.reverse(), // Reverse to show oldest first
        totalMessages,
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        hasMore: skip + messages.length < totalMessages
      };
    } catch (error) {
      throw error;
    }
  },

  // Get all chat conversations for a user
  getChatList: async (userId) => {
    try {
      // Get all unique users this user has chatted with
      const sentMessages = await chatSchema.distinct('receiver_id', { sender_id: userId });
      const receivedMessages = await chatSchema.distinct('sender_id', { receiver_id: userId });
      
      // Combine and get unique user IDs
      const allChatUserIds = [...new Set([...sentMessages, ...receivedMessages])];

      // Get last message with each user
      const chatList = await Promise.all(
        allChatUserIds.map(async (otherUserId) => {
          const lastMessage = await chatSchema.findOne({
            $or: [
              { sender_id: userId, receiver_id: otherUserId },
              { sender_id: otherUserId, receiver_id: userId }
            ]
          })
            .sort({ createdAt: -1 })
            .lean();

          const unreadCount = await chatSchema.countDocuments({
            sender_id: otherUserId,
            receiver_id: userId,
            isRead: false
          });

          const otherUser = await userSchema.findById(otherUserId)
            .select('name heartsId profilePic')
            .lean();

          return {
            userId: otherUserId,
            userName: otherUser?.name,
            heartsId: otherUser?.heartsId,
            profilePic: otherUser?.profilePic?.[0]?.s3Link || null,
            lastMessage: lastMessage?.message,
            lastMessageTime: lastMessage?.createdAt,
            unreadCount: unreadCount,
            isLastMessageFromMe: lastMessage?.sender_id.toString() === userId.toString()
          };
        })
      );

      // Sort by last message time and remove duplicates
      const uniqueChatList = chatList.reduce((acc, chat) => {
        // Check if this user already exists in the list
        const exists = acc.find(c => c.userId.toString() === chat.userId.toString());
        if (!exists) {
          acc.push(chat);
        }
        return acc;
      }, []);

      uniqueChatList.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

      return uniqueChatList;
    } catch (error) {
      throw error;
    }
  },

  // Mark messages as delivered
  markAsDelivered: async (messageIds) => {
    try {
      await chatSchema.updateMany(
        { _id: { $in: messageIds } },
        { $set: { isDelivered: true, updatedAt: new Date() } }
      );
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Mark messages as read
  markAsRead: async (senderId, receiverId) => {
    try {
      await chatSchema.updateMany(
        { sender_id: senderId, receiver_id: receiverId, isRead: false },
        { $set: { isRead: true, updatedAt: new Date() } }
      );
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Get unread message count
  getUnreadCount: async (userId) => {
    try {
      const count = await chatSchema.countDocuments({
        receiver_id: userId,
        isRead: false
      });
      return count;
    } catch (error) {
      throw error;
    }
  }
};
