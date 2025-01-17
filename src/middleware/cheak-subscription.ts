import { ContentType } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prismaClient';
import { ForbiddenError } from '../utils/errors/AppError';

export const checkSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.isAdmin;
    const { ContentType: contentType } = req.query;
    
    if (isAdmin) return next();

    if (!contentType) {
      throw new ForbiddenError('Content type parameter is missing.');
    }
  
    if (!Object.values(ContentType).includes(contentType as ContentType)) {
      throw new ForbiddenError(`Invalid content type '${contentType}' provided.`);
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        active: true,
        type: contentType as ContentType,
      },
    });

    if (!subscription) {
      throw new ForbiddenError('No active subscription found');
    }

    if (subscription.type !== contentType) {
      throw new ForbiddenError(`Subscription does not include access to ${contentType} content`);
    }

    next(); // Все ок, передаем управление дальше
  } catch (error) {
    next(error); // Если ошибка произошла, передаем её в следующий middleware
  }
};