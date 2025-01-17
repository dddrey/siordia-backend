

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors/AppError';

export const errorHandler = (
  err: AppError | Error, // Allow both AppError and generic Error types
  req: Request,
  res: Response,
  next: NextFunction
): any => { // Ensure the return type matches Response format
  console.log(err)
  // Handled errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        type: err.type,
        message: err.message,
        details: err.details || null,
      },
    });
  }

  // Fallback to generic error handler
  return res.status(500).json({
    error: {
      type: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong. Please try again later.',
    },
  });
};