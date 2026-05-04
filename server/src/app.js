require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Route imports
const authRoutes = require('./routes/auth');
const challengeRoutes = require('./routes/challenges');
const scannerRoutes = require('./routes/scanner');
const labRoutes = require('./routes/labs');
const dashboardRoutes = require('./routes/dashboard');
const terminalRoutes = require('./routes/terminal');
const leaderboardRoutes = require('./routes/leaderboard');
const targetSiteRoutes = require('./routes/targetSite');
const shopRoutes = require('./routes/shop');

// Socket handlers
const { registerTerminalSocket } = require('./sockets/terminal');
const { registerScannerSocket } = require('./sockets/scanner');

const app = express();
const httpServer = http.createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io available throughout the app
app.set('io', io);

// ── Security Middleware ─────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // disabled so lab iframes work
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' }
});
app.use(globalLimiter);

// ── Body Parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// ── API Routes ──────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/challenges',  challengeRoutes);
app.use('/api/scanner',     scannerRoutes);
app.use('/api/labs',        labRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/terminal',    terminalRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/target',      targetSiteRoutes);
app.use('/api/shop',        shopRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Bug Bounty Simulator API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// ── Socket.IO Namespaces ────────────────────────────────────────────
registerTerminalSocket(io);
registerScannerSocket(io);

// ── Start Server ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Bug Bounty Simulator API running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = { app, io };
