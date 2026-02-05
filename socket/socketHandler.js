const chatService = require("../api/chatController/chat.service");
const jwt = require("jsonwebtoken");

// Store active users: { userId: socketId }
const activeUsers = new Map();

// Store typing status: { roomId: { userId: isTyping } }
const typingStatus = new Map();

module.exports = (io) => {
  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      // Remove 'Bearer ' if present
      const cleanToken = token.replace('Bearer ', '');
      
      // Verify JWT token
      const decoded = jwt.verify(cleanToken, process.env.SECRET_KEY);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    
    // Don't log in production (CloudWatch costs)
    if (process.env.IS_PROD !== "TRUE") {
      console.log(`User connected: ${userId}, Socket: ${socket.id}`);
    }

    // Store active user
    activeUsers.set(userId, socket.id);

    // Notify all users that this user is online
    socket.broadcast.emit("user_online", { userId });

    // Send online users list to newly connected user
    const onlineUserIds = Array.from(activeUsers.keys());
    socket.emit("online_users", { userIds: onlineUserIds });

    // Join user to their personal room
    socket.join(userId);

    // Handle sending message
    socket.on("send_message", async (data) => {
      try {
        const { receiverId, message, messageType = 'text' } = data;
        
        if (!receiverId || !message) {
          socket.emit("error", { message: "receiverId and message are required" });
          return;
        }

        // Check if first-time chat initiation
        const hasInitiated = await chatService.hasInitiatedChat(userId, receiverId);
        
        let creditInfo = {
          creditDeducted: false,
          message: "Chat already initiated"
        };

        // If first time, deduct credit
        if (!hasInitiated) {
          try {
            creditInfo = await chatService.initiateChat(userId, receiverId);
          } catch (error) {
            socket.emit("error", { 
              message: error.message,
              type: "credit_error"
            });
            return;
          }
        }

        // Save message to database
        const savedMessage = await chatService.saveMessage(userId, receiverId, message, messageType);

        // Prepare message object
        const messageObj = {
          _id: savedMessage._id,
          messageId: savedMessage._id,
          senderId: userId,
          receiverId: receiverId,
          sender_id: userId,
          receiver_id: receiverId,
          message: message,
          messageType: messageType,
          isRead: false,
          isDelivered: false,
          createdAt: savedMessage.createdAt,
          creditDeducted: creditInfo.creditDeducted,
          tempId: data.tempId // Include tempId for matching
        };

        // Send to sender (confirmation)
        socket.emit("message_sent", messageObj);

        // Send to receiver if online
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", messageObj);
          
          // Mark as delivered
          await chatService.markAsDelivered([savedMessage._id]);
          
          // Update delivery status
          messageObj.isDelivered = true;
          
          // Notify sender that message was delivered
          socket.emit("message_delivered", { 
            messageId: savedMessage._id,
            receiverId: receiverId,
            tempId: data.tempId
          });
        }

      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: error.message });
      }
    });

    // Handle typing indicator
    socket.on("typing", (data) => {
      const { receiverId, isTyping } = data;
      
      if (!receiverId) return;

      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_typing", {
          userId: userId,
          isTyping: isTyping
        });
      }
    });

    // Handle message read
    socket.on("mark_as_read", async (data) => {
      try {
        const { senderId } = data;
        
        if (!senderId) return;

        // Mark messages as read
        await chatService.markAsRead(senderId, userId);

        // Notify sender that messages were read
        const senderSocketId = activeUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messages_read", {
            readBy: userId
          });
        }

      } catch (error) {
        console.error("Mark as read error:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      if (process.env.IS_PROD !== "TRUE") {
        console.log(`User disconnected: ${userId}, Socket: ${socket.id}, Reason: ${reason}`);
      }
      
      // Remove from active users
      activeUsers.delete(userId);

      // Notify all users that this user is offline
      socket.broadcast.emit("user_offline", { userId });
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  // Return helper functions
  return {
    getActiveUsers: () => Array.from(activeUsers.keys()),
    isUserOnline: (userId) => activeUsers.has(userId),
    getSocketId: (userId) => activeUsers.get(userId)
  };
};
