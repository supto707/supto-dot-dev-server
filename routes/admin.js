const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const Project = require('../models/Project');
const User = require('../models/User');

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProjects = await Project.countDocuments();
        const activeSubscriptions = await User.countDocuments({ plan: { $ne: 'none' } });

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalProjects,
                activeSubscriptions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// @route   GET /api/admin/projects
// @desc    Get all project inquiries
router.get('/projects', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
