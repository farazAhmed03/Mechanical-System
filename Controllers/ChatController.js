const Chat = require('../Models/ChatList');
const Message = require('../Models/Message');
const sendResponse = require('../Utils/Response');

// SEND MESSAGE
exports.sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user.userId;
        const { receiverId, content } = req.body;
        const files = req.files?.map(file => file.filename) || [];

        if (!receiverId) return sendResponse(res, 400, false, 'receiverId is required');
        if (!content && files.length === 0) return sendResponse(res, 400, false, 'Content or files required');

        const participants = [senderId, receiverId];
        let chat = await Chat.findOne({ participants: { $all: participants } });

        if (!chat) chat = await Chat.create({ participants });

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            chatId: chat._id,
            content,
            files,
        });

        chat.lastMessage = message._id;
        await chat.save();

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username image')
            .populate('receiver', 'username image');

        const io = req.app.get('io');
        if (io) {
            const receiverSocketId = io.onlineUsers?.get(receiverId);
            const senderSocketId = io.onlineUsers?.get(senderId);
            if (receiverSocketId) io.to(receiverSocketId).emit('receiveMessage', populatedMessage);
            if (senderSocketId) io.to(senderSocketId).emit('receiveMessage', populatedMessage);
        }

        return sendResponse(res, 201, true, 'Message sent successfully', populatedMessage);
    } catch (error) {
        next(error);
    }
};

// GET CHAT LIST
exports.getChatList = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const chats = await Chat.find({ participants: userId })
            .populate('participants', 'username image')
            .populate('lastMessage', 'content createdAt')
            .sort({ updatedAt: -1 });

        const chatList = chats.map(chat => {
            const otherUser = chat.participants.find(p => p._id.toString() !== userId);
            return {
                chatId: chat._id,
                participant: otherUser,
                lastMessage: chat.lastMessage || null
            };
        });

        return sendResponse(res, 200, true, 'Chat list fetched successfully', chatList);
    } catch (error) {
        next(error);
    }
};

// GET MESSAGES WITH A USER
exports.getChatMessages = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const otherUserId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId },
            ]
        })
            .populate('sender', 'username image')
            .populate('receiver', 'username image')
            .sort({ createdAt: 1 });

        return sendResponse(res, 200, true, 'Messages fetched successfully', messages);
    } catch (error) {
        next(error);
    }
};

// CLEAR CHAT
exports.clearChat = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const otherUserId = req.params.userId;

        await Message.deleteMany({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId },
            ]
        });

        return sendResponse(res, 200, true, 'Chat cleared successfully');
    } catch (error) {
        next(error);
    }
};
