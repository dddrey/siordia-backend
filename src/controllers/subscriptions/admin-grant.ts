import { Request, Response } from "express";
import { ContentType } from "@prisma/client";
import { asyncHandler } from "@/middleware/asyncHandler";
import { ValidationError } from "@/utils/errors/AppError";
import { prisma } from "@/prisma/prismaClient";

interface AdminGrantSubscriptionRequest {
  userId?: string;
  username?: string;
  type: ContentType;
  months: number;
}

export const adminGrantSubscription = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, username, type, months }: AdminGrantSubscriptionRequest =
      req.body;

    // Валидация входных данных
    if (!userId && !username) {
      throw new ValidationError("Необходимо указать userId или username");
    }

    if (!type || !Object.values(ContentType).includes(type as ContentType)) {
      throw new ValidationError(
        "Неверный тип подписки. Доступные типы: player, coach, parent"
      );
    }

    if (!months || months <= 0 || months > 120) {
      throw new ValidationError("Количество месяцев должно быть от 1 до 120");
    }

    // Находим пользователя
    let user;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscriptions: true },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { username: username },
        include: { subscriptions: true },
      });
    }

    if (!user) {
      throw new ValidationError("Пользователь не найден");
    }

    // Проверяем существующую подписку этого типа
    const existingSubscription = user.subscriptions.find(
      (sub) => sub.type === type
    );

    // Вычисляем дату окончания (months месяцев от текущей даты)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    if (existingSubscription) {
      // Если подписка уже существует, обновляем её
      const updatedSubscription = await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          startDate: new Date(),
          endDate: endDate,
          active: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: `Подписка ${type} для пользователя ${user.username} обновлена на ${months} месяцев`,
        subscription: updatedSubscription,
      });
    }

    // Создаем новую подписку
    const newSubscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        type,
        startDate: new Date(),
        endDate: endDate,
        active: true,
      },
    });

    res.status(201).json({
      success: true,
      message: `Подписка ${type} выдана пользователю ${user.username} на ${months} месяцев`,
      subscription: newSubscription,
    });
  }
);
