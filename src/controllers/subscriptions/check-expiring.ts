import { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { subscriptionNotificationService } from "@/services/subscription-notification.service";
import { prisma } from "@/prisma/prismaClient";
import { addDays, startOfDay, endOfDay } from "date-fns";

export const checkExpiringSubscriptions = asyncHandler(
  async (req: Request, res: Response) => {
    const tomorrow = addDays(new Date(), 1);
    const tomorrowStart = startOfDay(tomorrow);
    const tomorrowEnd = endOfDay(tomorrow);

    // Получаем список подписок, которые истекают завтра
    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        active: true,
        endDate: {
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            chatId: true,
            isActive: true,
          },
        },
      },
    });

    // Запускаем проверку и отправку уведомлений
    await subscriptionNotificationService.checkExpiringSubscriptions();

    res.json({
      success: true,
      message: "Проверка истекающих подписок выполнена",
      data: {
        expiringSubscriptionsCount: expiringSubscriptions.length,
        expiringSubscriptions: expiringSubscriptions.map((sub) => ({
          id: sub.id,
          type: sub.type,
          endDate: sub.endDate,
          user: {
            id: sub.user.id,
            username: sub.user.username,
            hasChat: !!sub.user.chatId,
            isActive: sub.user.isActive,
          },
        })),
      },
    });
  }
);
