class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function errorHandler(err, req, res, next) {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  let error = { ...err };
  error.message = err.message;

  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    const message = `Duplicate ${field} - this record already exists`;
    error = new AppError(message, 409);
  }

  if (err.code === 'P2025') {
    const message = 'Record not found';
    error = new AppError(message, 404);
  }

  if (err.code === 'P2003') {
    const message = 'Referenced record does not exist';
    error = new AppError(message, 400);
  }

  if (err.code === 'P2014') {
    const message = 'Invalid data provided';
    error = new AppError(message, 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  if (err.name === 'CastError') {
    const message = 'Invalid data format';
    error = new AppError(message, 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate ${field} value`;
    error = new AppError(message, 409);
  }

  const status = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err
    })
  });
}

function notFound(req, res, next) {
  const error = new AppError(`Route not found - ${req.originalUrl}`, 404);
  next(error);
}

module.exports = { 
  AppError, 
  errorHandler, 
  notFound 
};
