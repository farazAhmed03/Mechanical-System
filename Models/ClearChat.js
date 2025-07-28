const mongoose = require('mongoose');

const clearChatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    chatWith: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    clearedAt: {
        type: Date,
        default: Date.now,
    },
    
}, { timestamps: true });

module.exports = mongoose.model('ClearChat', clearChatSchema);
