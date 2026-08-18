/**
 * Global error handler.
 *
 * Maps the errors Mongoose throws onto the status codes they actually mean.
 * Without this everything became a 500, so a client sending a bad field could
 * not tell its own mistake apart from the server being broken — and a "500"
 * in the logs gave no hint that the real cause was validation.
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Bad field value, missing required field, value outside an enum
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const details = Object.values(err.errors || {}).map((e) => e.message);
    message = details.length ? details.join('; ') : 'Validation failed';
  }

  // Malformed ObjectId in a route param
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Unique index violation — e.g. a username or email already taken
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `That ${field} is already taken` : 'Duplicate value';
  }

  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired, please log in again';
  }

  // Log real server faults; client mistakes are noise
  if (statusCode >= 500) {
    console.error(`${req.method} ${req.originalUrl} →`, err);
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
