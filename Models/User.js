const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: [true, 'Username is required'],
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [3, 'Password must be at least 3 characters long'],
        // select: false
    },

    role: {
        type: String,
        trim: true,
        lowercase: true,
        enum: ['admin','client', 'user'],
        default: 'user'
    },


    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },

    image: {
        type: String,
        default: 'img.png',
    },

    lastLogin: {
        type: Date,
        default: Date.now
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    attempts : {
        type: Number,
        default: 0,
    },

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,

    deletionScheduledAt: {
        type: Date,
        default: null,
    },

}, { timestamps: true });


// Hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare hashed passwords
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};


module.exports = mongoose.model('User', userSchema);















// Auto-remove sensitive fields when sending to client
// UserSchema.set('toJSON', {
//     transform: function (doc, ret) {
//         delete ret.password;
//         delete ret.__v;
//         delete ret.createdAt;
//         delete ret.updatedAt;
//         delete ret.deletionScheduledAt;
//         delete ret.lastLogin;
//         delete ret._id;
//         return ret;
//     }
// });