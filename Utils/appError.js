/**
 * Error Class
 */
class AppError extends Error {
  /**
   * Creates an AppError instance 
   * @param {String} message error message
   * @param {number} statusCode error status code
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;