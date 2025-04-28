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

  // Проходимся по подпискам пользователя
  for (const subscription of subscriptions) {
    // Проверяем, если дата окончания подписки меньше текущей даты и подписка активна
    if (new Date(subscription.endDate) < currentDate && subscription.active) {
      // Обновляем подписку, устанавливая её как неактивную
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          active: false,
        },
      });
    }
  }

  // Продолжаем выполнение следующего мидлвара или маршрута
  next();
};
