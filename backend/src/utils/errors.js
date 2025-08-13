class AppError extends Error {
  constructor(message, status = 400, code = 'BAD_REQUEST') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Something went wrong'
  });
}

module.exports = { AppError, errorHandler };
