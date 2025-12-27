const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   GET /auth/me
 * @desc    Get current user profile (Verified via Firebase token)
 * @access  Private
 */
router.get('/me', authMiddleware, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

/**
 * @route   POST /auth/logout
 * @desc    Handled client-side by Firebase, but we can provide an endpoint for completeness
 * @access  Public
 */
router.post('/logout', (req, res) => {
    // Firebase handles token expiration and sign-out on the client.
    // We don't use httpOnly cookies for Firebase tokens in this implementation.
    res.json({
        success: true,
        message: 'Backend logout processed (client-side signout recommended)'
    });
});

module.exports = router;
