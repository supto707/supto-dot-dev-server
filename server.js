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
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        // On Vercel, we can't really "fallback" to a port, but locally we might
    }
};

// Trust proxy (needed for secure cookies behind reverse proxy)
app.set('trust proxy', 1);

// Middleware
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'https://supto-dot-dev-client.vercel.app'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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

// Export for Vercel
module.exports = app;

// Execute if running locally
if (require.main === module) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 API URL: http://localhost:${PORT}`);
        });
    });
} else {
    // On Vercel, connect immediately
    connectDB();
}
