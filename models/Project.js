const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Allow guest inquiries if needed, or make true if auth required
    },
    title: {
        type: String,
        required: false, // Can be inferred from brief if not explicit
    },
    brief: {
        type: String,
        required: true,
    },
    budget: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'Active', 'Completed', 'Archived'],
        default: 'Pending',
    },
    contactName: {
        type: String,
        required: true,
    },
    contactEmail: {
        type: String,
        required: true,
    },
    detailedMessage: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
