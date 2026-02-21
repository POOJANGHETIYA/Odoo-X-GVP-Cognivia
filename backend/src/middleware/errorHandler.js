/**
 * Error Handler Middleware
 * Catches all errors and returns appropriate responses
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        statusCode = 400;
        message = 'Duplicate entry';
        details = err.detail;
        break;
      case '23503': // foreign_key_violation
        statusCode = 400;
        message = 'Referenced record does not exist';
        details = err.detail;
        break;
      case '23502': // not_null_violation
        statusCode = 400;
        message = 'Required field is missing';
        details = err.column;
        break;
      case '22P02': // invalid_text_representation (invalid UUID)
        statusCode = 400;
        message = 'Invalid ID format';
        break;
      case 'ECONNREFUSED':
        statusCode = 503;
        message = 'Database connection refused';
        break;
    }
  }

  // Custom errors with status code
  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  const response = {
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      details,
      stack: err.stack,
    }),
  };

  res.status(statusCode).json(response);
};

/**
 * Not Found Handler
 * Handles requests to undefined routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
