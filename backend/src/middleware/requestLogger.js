/**
 * Request Logger Middleware
 * Logs incoming requests with timing information
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  console.log(`→ ${req.method} ${req.originalUrl}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusEmoji = status < 400 ? '✓' : '✗';
    
    console.log(`${statusEmoji} ${req.method} ${req.originalUrl} ${status} ${duration}ms`);
  });

  next();
};

module.exports = requestLogger;
