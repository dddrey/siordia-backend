import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors/AppError';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    
  if (!req.user || !req.user.isAdmin) {
    throw new ForbiddenError('Access denied. Admin rights required.');
  }
  
  next();
};
