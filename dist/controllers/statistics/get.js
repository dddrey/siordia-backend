"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatistics = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const prismaClient_1 = require("../../prisma/prismaClient");
exports.getStatistics = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Получаем общую статистику
    const [totalUsers, totalFolders, totalTopics, totalLessons, activeSubscriptions, viewsStats, subscriptionsByType, topViewedLessons,] = yield Promise.all([
        // Общее количество пользователей
        prismaClient_1.prisma.user.count(),
        // Общее количество папок
        prismaClient_1.prisma.folder.count(),
        // Общее количество тем
        prismaClient_1.prisma.topic.count(),
        // Общее количество уроков
        prismaClient_1.prisma.lesson.count(),
        // Активные подписки
        prismaClient_1.prisma.subscription.count({
            where: {
                active: true,
                endDate: {
                    gte: new Date(),
                },
            },
        }),
        // Статистика просмотров по типам контента
        prismaClient_1.prisma.lesson.groupBy({
            by: ["type"],
            _sum: {
                views: true,
            },
        }),
        // Статистика подписок по типам
        prismaClient_1.prisma.subscription.groupBy({
            by: ["type"],
            _count: true,
        }),
        // Топ-5 самых просматриваемых уроков
        prismaClient_1.prisma.lesson.findMany({
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
        viewsStatistics: viewsStats.reduce((acc, stat) => (Object.assign(Object.assign({}, acc), { [stat.type]: stat._sum.views })), {}),
        subscriptionsByType: subscriptionsByType.reduce((acc, stat) => (Object.assign(Object.assign({}, acc), { [stat.type]: stat._count })), {}),
        topLessons: topViewedLessons.map((lesson) => ({
            id: lesson.id,
            name: lesson.name,
            views: lesson.views,
            topicName: lesson.topic.name,
            folderName: lesson.topic.folder.name,
        })),
    };
    res.json(statistics);
}));
