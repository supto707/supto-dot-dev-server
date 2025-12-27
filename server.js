require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const checkoutRoutes = require('./routes/checkout');
const userRoutes = require('./routes/user');

const app = express();

// Trust proxy (needed for secure cookies behind reverse proxy)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', require('./routes/admin'));

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Supto.dev API Server',
        version: '1.0.0',
        endpoints: {
            auth: '/auth/google',
            contact: '/api/contact',
            checkout: '/api/checkout',
            user: '/api/user/profile'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 API URL: http://localhost:${PORT}`);
            console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);

        // Start server anyway for testing without MongoDB
        if (process.env.NODE_ENV === 'development') {
            console.log('⚠️  Starting server without MongoDB connection...');
            app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT} (no database)`);
            });
        } else {
            process.exit(1);
        }
    }
};

startServer();
