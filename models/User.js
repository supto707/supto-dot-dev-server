const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
    },
    plan: {
        type: String,
        enum: ['none', 'starter', 'growth', 'pro', 'enterprise'],
        default: 'none',
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    purchaseHistory: [{
        plan: String,
        amount: Number,
        date: {
            type: Date,
            default: Date.now,
        },
        sessionId: String,
    }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
