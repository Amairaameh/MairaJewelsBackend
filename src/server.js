const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = parseInt(process.env.PORT, 10) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const BASE_URL = process.env.API_URL || (NODE_ENV === 'production' ? 'https://api.mairajewels.co.za' : `http://localhost:${PORT}`);

// Connect to MongoDB Atlas
connectDB();

const server = http.createServer(app);

// Optimize server timeouts for reverse proxies (Nginx / Cloudflare / Load Balancers)
// Keep-alive timeout higher than reverse proxy timeout avoids intermittent 502 Bad Gateway errors
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Start Listening on all network interfaces
server.listen(PORT, '0.0.0.0', () => {
    console.log(`========================================================`);
    console.log(`✨  MAIRA JEWELS ENTERPRISE API SERVER STARTED  ✨`);
    console.log(`========================================================`);
    console.log(`🚀 Environment : ${NODE_ENV.toUpperCase()}`);
    console.log(`📡 Port        : ${PORT}`);
    console.log(`🔗 API Base URL: ${BASE_URL}`);
    console.log(`🏥 Health Check: ${BASE_URL}/api/v1/health`);
    console.log(`💎 Cloudflare  : Active (R2 Object Storage & CDN Enabled)`);
    console.log(`📧 Mail Engine : Active (Gmail SMTP)`);
    console.log(`========================================================`);
});

// Graceful Shutdown Handler
const gracefulShutdown = (signal) => {
    console.log(`\n[Process] ${signal} signal received. Initiating graceful shutdown...`);

    server.close(async () => {
        console.log('[Server] Closed active HTTP connections.');
        try {
            await mongoose.connection.close(false);
            console.log('[Database] MongoDB Atlas connection cleanly closed.');
            process.exit(0);
        } catch (dbErr) {
            console.error('[Shutdown Error] Failed to cleanly disconnect MongoDB:', dbErr.message);
            process.exit(1);
        }
    });

    // Force shutdown if connections do not close within 10 seconds
    setTimeout(() => {
        console.error('[Server] Graceful shutdown timed out (10s). Forcefully terminating.');
        process.exit(1);
    }, 10000);
};

// Listen for termination and interrupt signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
    console.error(`[FATAL] Uncaught Exception: ${err.message}`);
    console.error(err.stack);
    gracefulShutdown('uncaughtException');
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
    console.error(`[FATAL] Unhandled Rejection: ${err.message}`);
    if (err.stack) console.error(err.stack);
    gracefulShutdown('unhandledRejection');
});
