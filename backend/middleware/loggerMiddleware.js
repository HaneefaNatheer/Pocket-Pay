const loggerMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    if (res.statusCode >= 400) {
      console.error(`[ERROR] ${log}`);
    } else {
      console.log(`[INFO] ${log}`);
    }
  });

  next();
};

module.exports = loggerMiddleware;
