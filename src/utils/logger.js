const logger = {
  info: (message, data = {}) => {
    console.log(`[${new Date().toISOString()}] INFO: ${message}`, Object.keys(data).length ? data : '');
  },

  error: (message, error = {}) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, {
      message: error.message,
      stack: error.stack,
      ...error
    });
  },

  warn: (message, data = {}) => {
    console.warn(`[${new Date().toISOString()}] WARN: ${message}`, Object.keys(data).length ? data : '');
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${new Date().toISOString()}] DEBUG: ${message}`, Object.keys(data).length ? data : '');
    }
  },

  request: (req, res, next) => {
    const start = Date.now();
    logger.info(`Request: ${req.method} ${req.url}`, {
      userId: req.user?.userId || 'unauthenticated',
      ip: req.ip
    });

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`Response: ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });

    next();
  }
};

module.exports = logger;