import { prisma } from "@/prisma/prismaClient";
import { broadcastService } from "@/bot/core";
import { MessageSettings } from "@/bot/broadcast/types";
import { BroadcastStatus } from "@prisma/client";

interface CreateBroadcastData {
  text: string;
  buttonText?: string;
  buttonUrl?: string;
  imageUrl?: string;
}

export class BroadcastManagementService {
  /**
   * Создает новую рассылку в БД
   */
  async createBroadcast(data: CreateBroadcastData) {
    const { text, buttonText, buttonUrl, imageUrl } = data;
    // Создаем запись в БД
    const broadcast = await prisma.broadcast.create({
      data: {
        text,
        imageUrl,
        buttonText,
        buttonUrl,
        status: BroadcastStatus.PENDING,
      },
    });

    console.log(broadcast);

    return broadcast;
  }

  /**
   * Запускает рассылку
   */
  async startBroadcast(broadcastId: string) {
    // Получаем рассылку
    const broadcast = await prisma.broadcast.findUnique({
      where: { id: broadcastId },
    });

    if (!broadcast) {
      throw new Error("Рассылка не найдена");
    }

    if (broadcast.status !== BroadcastStatus.PENDING) {
      throw new Error("Рассылка уже была запущена или завершена");
    }

    // Получаем активных пользователей
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        chatId: { not: null },
      },
    });

    // Обновляем статус на IN_PROGRESS
    await prisma.broadcast.update({
      where: { id: broadcastId },
      data: {
        status: BroadcastStatus.IN_PROGRESS,
        startedAt: new Date(),
        totalUsers: users.length,
      },
    });

    try {
      // Подготавливаем настройки сообщения
      const messageSettings: MessageSettings = {
        text: broadcast.text,
        photo: broadcast.imageUrl || undefined,
        buttonText: broadcast.buttonText || undefined,
        buttonUrl: broadcast.buttonUrl || undefined,
        parse_mode: broadcast.parseMode as any,
        disable_web_page_preview: broadcast.disableWebPreview,
      };

      console.log(messageSettings);

      // Запускаем рассылку
      const result = await broadcastService.broadcast(users, messageSettings, {
        delayMs: broadcast.delayMs,
        skipInactive: broadcast.skipInactive,
        retryOnRateLimit: broadcast.retryOnRateLimit,
      });

      // Обновляем результаты в БД
      await prisma.broadcast.update({
        where: { id: broadcastId },
        data: {
          status: BroadcastStatus.COMPLETED,
          successCount: result.successCount,
          errorCount: result.errorCount,
          skippedCount:
            result.totalUsers - result.successCount - result.errorCount,
          errorLog: result.errors.slice(0, 100), // Ограничиваем количество ошибок
          completedAt: new Date(),
        },
      });

      return result;
    } catch (error) {
      // Обновляем статус на FAILED
      await prisma.broadcast.update({
        where: { id: broadcastId },
        data: {
          status: BroadcastStatus.FAILED,
          errorLog: [String(error)],
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }

  /**
   * Получает статус рассылки
   */
  async getBroadcastStatus(broadcastId: string) {
    const broadcast = await prisma.broadcast.findUnique({
      where: { id: broadcastId },
    });

    if (!broadcast) {
      throw new Error("Рассылка не найдена");
    }

    return {
      id: broadcast.id,
      status: broadcast.status,
      totalUsers: broadcast.totalUsers,
      successCount: broadcast.successCount,
      errorCount: broadcast.errorCount,
      skippedCount: broadcast.skippedCount,
      createdAt: broadcast.createdAt,
      startedAt: broadcast.startedAt,
      completedAt: broadcast.completedAt,
    };
  }

  /**
   * Получает список всех рассылок
   */
  async getAllBroadcasts() {
    const broadcasts = await prisma.broadcast.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        text: true,
        totalUsers: true,
        successCount: true,
        errorCount: true,
        createdAt: true,
        completedAt: true,
      },
    });

    return broadcasts;
  }
}

export const broadcastManagementService = new BroadcastManagementService();
