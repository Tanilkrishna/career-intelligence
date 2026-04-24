require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/career-intelligence';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Security Middlewares
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const analysisRoutes = require('./modules/jobs/analysis.routes');
const skillRoutes = require('./modules/skills/skill.routes');
const careerRoutes = require('./modules/users/career.routes');
const globalErrorHandler = require('./core/errorHandler');
const AppError = require('./core/AppError');
const protect = require('./core/middleware/auth.middleware');
const cookieParser = require('cookie-parser');

// General Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'https://career-intelligence-omega.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    console.log('[CORS] Request from Origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('[CORS] Blocked Origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// The app.use(cors()) below handles both normal and preflight (OPTIONS) requests natively.
// No explicit app.options required.

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev')); // HTTP logging

// Initialize background worker
require('./jobs/worker');

// API Versioning and Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Career Intelligence API is running' });
});

// Public Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/skills', skillRoutes); // Skills dict can be public

// Protected Routes
app.use('/api/v1/users', protect, userRoutes);
app.use('/api/v1/analysis', protect, analysisRoutes);
app.use('/api/v1/career', protect, careerRoutes);

// Catch undefined routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
