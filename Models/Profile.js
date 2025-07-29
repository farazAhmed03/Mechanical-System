const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    
    gender: {
        type: String,
        enum: ['male', 'female', 'Other'],
        default: null,
    },
    dateOfBirth: {
        type: String,
        default: null,
    },

    about: {
        type: String,
        trim: true,
        default: null,
    },

    contactNumber: {
        type: String,
        trim: true,
        default: null,
    },

    location: {
        type: String,
        trim: true,
        default: null,
    },

    workingHours: {
        type: String,
        default: null,
    },

    certifications: {
        type: String,
        default: null,
    },
    
    services: {
        type: String,
        default: null,
    },
});

module.exports = mongoose.model('Profile', profileSchema);
