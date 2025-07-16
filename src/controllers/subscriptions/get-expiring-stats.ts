import { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { prisma } from "@/prisma/prismaClient";
import { addDays, startOfDay, endOfDay, format } from "date-fns";
import { ru } from "date-fns/locale";

export const getExpiringStats = asyncHandler(
  async (req: Request, res: Response) => {
    const tomorrow = addDays(new Date(), 1);
    const tomorrowStart = startOfDay(tomorrow);
    const tomorrowEnd = endOfDay(tomorrow);

    const nextWeek = addDays(new Date(), 7);
    const nextWeekStart = startOfDay(new Date());
    const nextWeekEnd = endOfDay(nextWeek);

    // Получаем подписки, которые истекают завтра
    const expiringTomorrow = await prisma.subscription.findMany({
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

    // Получаем подписки, которые истекают в течение недели
    const expiringThisWeek = await prisma.subscription.findMany({
      where: {
        active: true,
        endDate: {
          gte: nextWeekStart,
          lte: nextWeekEnd,
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

    // Группируем по типам подписок
    const tomorrowByType = expiringTomorrow.reduce(
      (acc, sub) => {
        acc[sub.type] = (acc[sub.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const weekByType = expiringThisWeek.reduce(
      (acc, sub) => {
        acc[sub.type] = (acc[sub.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Подсчитываем пользователей, которым можно отправить уведомления
    const notifiableUsers = expiringTomorrow.filter(
      (sub) => sub.user.chatId && sub.user.isActive
    );

    res.json({
      success: true,
      data: {
        tomorrow: {
          date: format(tomorrow, "d MMMM yyyy", { locale: ru }),
          total: expiringTomorrow.length,
          notifiable: notifiableUsers.length,
          byType: tomorrowByType,
          subscriptions: expiringTomorrow.map((sub) => ({
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
        thisWeek: {
          dateRange: `${format(new Date(), "d MMMM", { locale: ru })} - ${format(nextWeek, "d MMMM yyyy", { locale: ru })}`,
          total: expiringThisWeek.length,
          byType: weekByType,
        },
      },
    });
  }
);
