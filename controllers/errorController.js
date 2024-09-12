const AppError = require("../Utils/appError");
const handleCastErrorDB = err => {
  const msg = `Invalid ${err.path}: ${err.value}`;
  return new AppError(msg, 400);
};

const handleDuplicateFieldsDB = err => {
  const msg = `Duplicate field : ${JSON.stringify(err.keyValue).replace(/"/g, '\'')}`;
  return new AppError(msg, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(err => err.message);
  let msg = `Invalid input data: `;
  errors.forEach(s => {
    msg += `${s}`;
  });
  return new AppError(msg, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  else {
    console.error('ERROR OCCURED: ' + { err });

    res.status(500).json({
      status: 'error',
      message: 'Internal Error'
    });
  }
};

module.exports = (err, req, res, next) => {

  err.statusCode ||= 500;
  err.status ||= 'error';

  if (process.env.NODE_ENV === 'development')
    sendErrorDev(err, res);
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    // 处理Mongo数据库生成的错误
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    else if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    else if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    else if (err.name === 'TokenExpiredError') error = new AppError('Token expired! Please login again.', 401);
    else if (err.name === 'JsonWebTokenError') error = new AppError('Invalid token! Please login again.', 401);
    sendErrorProd(error, res);
  }
};