const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();

// =============================================================================
// MIDDLEWARE
// =============================================================================

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
  app.use(requestLogger);
}

// =============================================================================
// ROUTES
// =============================================================================

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'FleetFlow API',
    version: '1.0.0',
    description: 'Fleet Management System Backend API',
    endpoints: {
      health: '/api/health',
      vehicles: '/api/vehicles',
      drivers: '/api/drivers',
      trips: '/api/trips',
      expenses: '/api/expenses',
      maintenance: '/api/maintenance',
      dashboard: '/api/dashboard',
    },
  });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// =============================================================================
// SERVER STARTUP
// =============================================================================

const startServer = async () => {
  try {
    // Test database connection
    const db = require('./db');
    await db.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Start server
    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚛 FleetFlow API Server                                     ║
║                                                               ║
║   Server running on: http://localhost:${config.port}                 ║
║   Environment: ${config.nodeEnv.padEnd(45)}║
║                                                               ║
║   Endpoints:                                                  ║
║   • GET  /api/health          - Health check                  ║
║   • GET  /api/vehicles        - List vehicles                 ║
║   • GET  /api/drivers         - List drivers                  ║
║   • GET  /api/trips           - List trips                    ║
║   • GET  /api/expenses        - List expenses                 ║
║   • GET  /api/maintenance     - List maintenance logs         ║
║   • GET  /api/dashboard/*     - Dashboard data                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.log('\n💡 Make sure PostgreSQL is running and connection details are correct in .env');
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

module.exports = app;
