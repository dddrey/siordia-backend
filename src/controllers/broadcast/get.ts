import { asyncHandler } from "@/middleware/asyncHandler";
import { Request, Response } from "express";
import { prisma } from "@/prisma/prismaClient";

export const getAllBroadcasts = asyncHandler(
  async (req: Request, res: Response) => {
    const broadcasts = await prisma.broadcast.findMany({
      orderBy: { createdAt: "desc" },
    });

    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        isActive: true,
        chatId: true,
        createdAt: true,
        registrationDate: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Получаем пользователей, которым можно отправить broadcast
    const availableUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        chatId: { not: null },
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        chatId: true,
        createdAt: true,
        registrationDate: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(allUsers.length);

    return res.json({
      broadcasts,
      users: {
        all: allUsers,
        available: availableUsers,
        stats: {
          totalUsers: allUsers.length,
          activeUsers: allUsers.filter((user) => user.isActive).length,
          usersWithChatId: allUsers.filter((user) => user.chatId).length,
          availableForBroadcast: availableUsers.length,
        },
      },
    });
  }
);
