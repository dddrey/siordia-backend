import { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { prisma } from "@/prisma/prismaClient";

export const getStatistics = asyncHandler(
  async (req: Request, res: Response) => {
    // Получаем общую статистику
    const [
      totalUsers,
      totalFolders,
      totalTopics,
      totalLessons,
      activeSubscriptions,
      viewsStats,
      subscriptionsByType,
      topViewedLessons,
    ] = await Promise.all([
      // Общее количество пользователей
      prisma.user.count(),

      // Общее количество папок
      prisma.folder.count(),

      // Общее количество тем
      prisma.topic.count(),

      // Общее количество уроков
      prisma.lesson.count(),

      // Активные подписки
      prisma.subscription.count({
        where: {
          active: true,
          endDate: {
            gte: new Date(),
          },
        },
      }),

      // Статистика просмотров по типам контента
      prisma.lesson.groupBy({
        by: ["type"],
        _sum: {
          views: true,
        },
      }),

      // Статистика подписок по типам
      prisma.subscription.groupBy({
        by: ["type"],
        _count: true,
      }),

      // Топ-5 самых просматриваемых уроков
      prisma.lesson.findMany({
        take: 5,
        orderBy: {
          views: "desc",
        },
        select: {
          id: true,
          name: true,
          views: true,
          topic: {
            select: {
              name: true,
              folder: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const statistics = {
      overview: {
        totalUsers,
        totalFolders,
        totalTopics,
        totalLessons,
        activeSubscriptions,
      },
      viewsStatistics: viewsStats.reduce(
        (acc, stat) => ({
          ...acc,
          [stat.type]: stat._sum.views,
        }),
        {}
      ),
      subscriptionsByType: subscriptionsByType.reduce(
        (acc, stat) => ({
          ...acc,
          [stat.type]: stat._count,
        }),
        {}
      ),
      topLessons: topViewedLessons.map((lesson) => ({
        id: lesson.id,
        name: lesson.name,
        views: lesson.views,
        topicName: lesson.topic.name,
        folderName: lesson.topic.folder.name,
      })),
    };

    res.json(statistics);
  }
);
