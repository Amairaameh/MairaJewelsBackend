const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

const app = express();

// Trust proxy - required when behind nginx/reverse proxy
// This enables express-rate-limit to correctly identify client IPs
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: false
}));

// Enable CORS for Frontend & Admin
app.use(cors({
    origin: [
        'https://www.mairajewels.co.za',
        'https://mairajewels.co.za',
        'https://admin.mairajewels.co.za',
        'http://localhost:3000',
        'http://localhost:3445',
        'http://localhost:3001',
        'http://localhost:5173', // Vite default
        'http://localhost:5174'  // Vite alternative
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
}));

// Manual CORS fallback and preflight handler
app.use((req, res, next) => {
    const allowedOrigins = [
        'https://www.mairajewels.co.za',
        'https://mairajewels.co.za',
        'https://admin.mairajewels.co.za',
        'http://localhost:3000',
        'http://localhost:3445',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:5174'
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    // Prevent browser caching issues - disable cache for API responses
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate Limiting (1000 requests per 15 minutes)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});
app.use('/api', limiter);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static files (robots.txt, favicon.ico)
app.use(express.static(path.join(__dirname, '../public')));

// Root landing message
app.get('/', (req, res) => {
    res.json({
        name: 'Maira Jewels Luxury Fine Jewellery API',
        status: 'Active',
        version: '1.0.0',
        documentation: '/api/v1/health'
    });
});

// Mount Master API Router
app.use('/api/v1', routes);
app.use('/api', routes);

// 404 handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
