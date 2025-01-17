import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';  // Assuming you have asyncHandler for error handling
import { NotFoundError, ValidationError } from '../utils/errors/AppError';
import prisma from '../prisma/prismaClient';
import { ContentType, Prisma } from '@prisma/client';

export const addSubscription = asyncHandler(async (req: Request, res: Response) => {
  const id = req.user?.id;
  const { type } = req.body;

  if (!type || !Object.values(ContentType).includes(type as ContentType)) {
    throw new ValidationError('Invalid subscription type');
  }

  if (!id) {
    throw new ValidationError('User not authenticated');
  }

  const newSubscription = await prisma.subscription.create({
    data: {
      type: type as ContentType,
      active: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      user: { connect: { id } },
    },
  });

  res.status(201).json(newSubscription);
});

export const removeAllSubscriptions = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const deletedSubscriptions = await prisma.subscription.deleteMany({
    where: { userId },
  });

  if (deletedSubscriptions.count === 0) {
    throw new NotFoundError('No subscriptions found for this user');
  }

  res.json({ message: 'All subscriptions removed successfully' });
});

export const removeSubscriptionById = asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;

  const deletedSubscription = await prisma.subscription.delete({
    where: { id: subscriptionId },
  });

  if (!deletedSubscription) {
    throw new NotFoundError('Subscription not found');
  }

  res.json({ message: 'Subscription removed successfully' });
});
