const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    originalName: {
        String
    },

    mimeType: {
        String
    },

    path: {
        String
    },

    size: {
        Number
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('File', fileSchema);
