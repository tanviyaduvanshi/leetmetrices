require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');
const platformRoutes = require('./routes/platforms');
const leaderboardRoutes = require('./routes/leaderboard');
const goalsRoutes = require('./routes/goals');

const app = express();

/**
 * STARTUP SEQUENCE
 */
async function startServer() {
  console.log('[STARTUP] Starting LeetMetrices API...');
  
  try {
    // 1. Connect Database (Will exit process if URI is missing/placeholder)
    console.log('[STARTUP] Initializing database connection...');
    await connectDB();
    console.log('[STARTUP] Database initialized.');

    // 2. Middlewares
    app.use(helmet());
    app.use(cors({
      origin: function (origin, callback) {
        callback(null, true);
      },
      credentials: true,
    }));

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, 
      max: 100,
      message: { error: 'Too many requests, please try again later.' },
    });
    app.use('/api/', limiter);

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    }

    // 3. Health Check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString(), version: '1.0.0' });
    });

    // 4. Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/stats', statsRoutes);
    app.use('/api/platforms', platformRoutes);
    app.use('/api/leaderboard', leaderboardRoutes);
    app.use('/api/goals', goalsRoutes);

    // 5. Handlers
    app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    app.use((err, req, res, next) => {
      console.error('Global error:', err);
      res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      });
    });

    // 6. Listen
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n🚀 LeetMetrices API running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV}`);
      console.log(`   Database: ${process.env.MONGO_URI || process.env.MONGODB_URI}\n`);
    });

  } catch (error) {
    console.error('[STARTUP] Failed to start server:', error);
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.exit(1);
  }
}

// Execute startup
startServer();

module.exports = app;
