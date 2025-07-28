const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
    },
    content: {
        type: String,
        default: null,
    },
    files: [{
        type: String,
    }],
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent',
    },

    isRead: {
        type: Boolean,
        default: false,
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },
    

}, {
    timestamps: true,
});

module.exports = mongoose.model('Message', messageSchema);