import { Request, Response, NextFunction } from "express";
import { prisma } from "@/prisma/prismaClient";
import { ValidationError } from "@/utils/errors/AppError";

// Мидлвар для проверки просроченных подписок
export const checkExpiredSubscriptions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new ValidationError("User not found"));
  }

  const { subscriptions } = req.user;

  const currentDate = new Date();

  for (const subscription of subscriptions) {
    if (new Date(subscription.endDate) < currentDate && subscription.active) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          active: false,
        },
      });
    }
  }

  next();
};
