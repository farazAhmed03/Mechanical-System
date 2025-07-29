const mongoose = require('mongoose');

const mechanicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    category: {
        type: String,
        enum: ['Car', 'Bike'],
        required: true,
    },

    experience: {
        type: String,
        required: true,
    },

    workshop: {
        type: String,
        required: true,
    },

    rating: {
        type: String,
        required: true,
    },

    location: {
        type: String,
        required: true,
    },

    image: {
        type: String,
    },

    type: {
        type: String,
        enum: ['Old', 'New'],
        required: true,
    },

}, { timestamps: true, });

module.exports = mongoose.model('Mechanic', mechanicSchema);
