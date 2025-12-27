const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// POST /api/contact - Submit a new project inquiry
router.post('/', async (req, res) => {
    try {
        const { name, email, brief, message } = req.body;

        // Validate required fields
        if (!name || !email || !brief) {
            return res.status(400).json({ message: 'Name, email, and project brief are required' });
        }

        const newProject = new Project({
            contactName: name,
            contactEmail: email,
            brief: brief,
            detailedMessage: message,
            // userId can be attached here if user is logged in (would need auth middleware optional)
        });

        await newProject.save();

        res.status(201).json({ message: 'Project inquiry submitted successfully', project: newProject });
    } catch (error) {
        console.error('Error submitting project inquiry:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/contact - Get all project inquiries (Protected - Admin only ideally)
// For now, we'll keep it simple or remove if n/a
router.get('/', async (req, res) => {
    // Add auth middleware here if needed
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
