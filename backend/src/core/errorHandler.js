const AppError = require('./AppError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      error = new AppError(`Invalid input data. ${messages.join('. ')}`, 400);
    }
    
    // Handle Zod validation errors
    if (err.name === 'ZodError') {
      const messages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      error = new AppError(`Validation failed. ${messages.join('. ')}`, 400);
    }

    // Ensure our new error object is also operational
    if (err.name === 'ValidationError' || err.name === 'ZodError') {
      error.isOperational = true;
    }

    sendErrorProd(error, res);
  }
};
