const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Initialize MongoDB Connection
connectDB();

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'SafeNet - AI Digital Wellbeing Platform',
    status: 'online',
    version: '1.0.0',
    documentation: '/docs',
    timestamp: new Date()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/usage', require('./routes/usageRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/ml', require('./routes/mlRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[SafeNet Backend] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[UnhandledRejection Error]:', err.message);
});

module.exports = app;
