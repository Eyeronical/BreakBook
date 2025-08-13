class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode || 400
  }
}

function errorHandler(err, req, res, next) {
  console.error(err)
  const status = err.statusCode || 500
  res.status(status).json({ message: err.message || 'Internal Server Error' })
}

module.exports = { AppError, errorHandler }
