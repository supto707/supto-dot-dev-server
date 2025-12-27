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

// @route   GET /api/admin/users
// @desc    Get all users
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-googleId').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// @route   PATCH /api/admin/users/:id/role
// @desc    Update user role
router.patch('/users/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-googleId');

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
