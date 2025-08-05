import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

interface ErrorWithStatus extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Default error response
  let status = err.status || 500;
  let message = err.message || 'Internal server error';
  let error = 'Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    error = 'Validation Error';
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    error = 'Unauthorized';
    message = 'Invalid authentication';
  } else if (err.code === 'P2002') {
    // Prisma unique constraint violation
    status = 409;
    error = 'Conflict';
    message = 'Resource already exists';
  } else if (err.code === 'P2025') {
    // Prisma record not found
    status = 404;
    error = 'Not Found';
    message = 'Resource not found';
  }

  // Send error response
  res.status(status).json({
    error,
    message: isDevelopment ? message : error,
    ...(isDevelopment && { stack: err.stack }),
  });
};