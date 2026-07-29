class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    const messages = err.errors.map((e) => e.message);
    message = messages.join(', ');
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    const messages = err.errors.map((e) => `${e.path} already exists`);
    message = messages.join(', ');
  }

  if (err.name === 'SequelizeDatabaseError') {
    statusCode = 500;
    message = 'Database error occurred.';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired.';
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference to related resource.';
  }

  if (err.name === 'SequelizeConnectionError') {
    statusCode = 503;
    message = 'Database connection failed.';
  }

  console.error(`[ERROR] ${statusCode} - ${message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { AppError, errorHandler };
