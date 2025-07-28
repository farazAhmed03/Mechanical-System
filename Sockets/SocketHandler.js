const Chat = require('../Models/ChatList');
const Message = require('../Models/Message');

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User online
    socket.on('user-online', (userId) => {
      socket.userId = userId;
      onlineUsers.set(userId, socket.id);
      io.emit('update-online-users', Array.from(onlineUsers.keys()));
      console.log(`User online: ${userId}`);
    });

    // Typing indicator
    socket.on('typing', ({ fromUserId, toUserId }) => {
      const toSocketId = onlineUsers.get(toUserId);
      if (toSocketId) {
        io.to(toSocketId).emit('typing', { fromUserId });
      }
    });

    // Typing indicator
    socket.on('stopTyping', ({ fromUserId, toUserId }) => {
      const toSocketId = onlineUsers.get(toUserId);
      if (toSocketId) {
        io.to(toSocketId).emit('stopTyping', { fromUserId });
      }
    });

    // Send message & save to DB
    socket.on('send-message', async ({ caseId, chatId, senderId, receiverId, content, files }) => {
      try {
        let chat = chatId
          ? await Chat.findById(chatId)
          : await Chat.findOne({
              participants: { $all: [senderId, receiverId] },
              caseId,
            });

        if (!chat) {
          chat = await Chat.create({
            participants: [senderId, receiverId],
            caseId,
          });
        }

        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          chatId: chat._id,
          content,
          files,
          status: 'sent',
        });

        chat.lastMessage = message._id;
        await chat.save();

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username email')
          .populate('receiver', 'username email');

        // Emit message to receiver
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new-message', populatedMessage);
        }

        // Emit message back to sender
        io.to(onlineUsers.get(senderId)).emit('new-message', populatedMessage);

      } catch (error) {
        console.error('Error sending message:', error);
        io.to(socket.id).emit('error', 'Message sending failed');
      }
    });

    // Mark message as read
    socket.on('message-read', async ({ messageId, readerId }) => {
      try {
        const message = await Message.findById(messageId);
        if (message && message.receiver.toString() === readerId) {
          message.status = 'read';
          await message.save();

          const senderSocketId = onlineUsers.get(message.sender.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit('message-status-updated', { messageId, status: 'read' });
          }
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // User disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('update-online-users', Array.from(onlineUsers.keys()));
        console.log(`User disconnected: ${socket.userId}`);
      }
    });
  });
};

module.exports = socketHandler;
