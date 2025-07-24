import { asyncHandler } from "@/middleware/asyncHandler";
import { Request, Response } from "express";
import { prisma } from "@/prisma/prismaClient";
import { ValidationError } from "@/utils/errors/AppError";
import * as XLSX from "xlsx";
import bot from "@/bot/core";
import { InputFile } from "grammy";

export const exportUsers = asyncHandler(async (req: Request, res: Response) => {
  // Проверяем что у админа есть chatId для отправки файла
  if (!req.user?.chatId) {
    throw new ValidationError("У пользователя нет chatId для отправки файла");
  }

  // Получаем всех пользователей
  const users = await prisma.user.findMany({
    include: {
      subscriptions: {
        where: {
          active: true,
        },
        select: {
          id: true,
          type: true,
          startDate: true,
          endDate: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Подготавливаем данные для Excel
  const excelData = users.map((user, index) => {
    const activeSubscriptions = user.subscriptions
      .map((sub) => sub.type)
      .join(", ");
    const subscriptionEndDates = user.subscriptions
      .map((sub) => new Date(sub.endDate).toLocaleDateString("ru-RU"))
      .join(", ");

    return {
      "№": index + 1,
      "ID пользователя": user.id,
      "Имя пользователя": user.username,
      Админ: user.isAdmin ? "Да" : "Нет",
      Активен: user.isActive ? "Да" : "Нет",
      "Дата регистрации": user.registrationDate
        ? new Date(user.registrationDate).toLocaleDateString("ru-RU")
        : "Не указана",
      "Дата создания": new Date(user.createdAt).toLocaleDateString("ru-RU"),
      "Chat ID": user.chatId || "Не указан",
      "URL аватара": user.avatarUrl || "Не указан",
      "Активные подписки": activeSubscriptions || "Нет",
      "Дата окончания подписок": subscriptionEndDates || "Нет",
      "Количество подписок": user.subscriptions.length,
    };
  });

  // Создаем workbook и worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Настраиваем ширину колонок для лучшего отображения
  const columnWidths = [
    { wch: 5 }, // №
    { wch: 20 }, // ID пользователя
    { wch: 25 }, // Имя пользователя
    { wch: 8 }, // Админ
    { wch: 8 }, // Активен
    { wch: 18 }, // Дата регистрации
    { wch: 18 }, // Дата создания
    { wch: 15 }, // Chat ID
    { wch: 30 }, // URL аватара
    { wch: 20 }, // Активные подписки
    { wch: 25 }, // Дата окончания подписок
    { wch: 15 }, // Количество подписок
  ];

  worksheet["!cols"] = columnWidths;

  // Добавляем worksheet в workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Пользователи");

  // Генерируем буфер Excel файла
  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  // Формируем имя файла с датой
  const fileName = `users_export_${new Date().toISOString().split("T")[0]}.xlsx`;

  try {
    // Отправляем файл админу через Telegram бота
    await bot.api.sendDocument(
      Number(req.user.chatId),
      new InputFile(excelBuffer, fileName),
      {
        caption:
          `📊 Экспорт пользователей\n\n` +
          `📅 Дата создания: ${new Date().toLocaleDateString("ru-RU")}\n` +
          `👥 Всего пользователей: ${users.length}\n` +
          `✅ Активных: ${users.filter((u) => u.isActive).length}\n` +
          `🔐 Админов: ${users.filter((u) => u.isAdmin).length}\n` +
          `📱 С подписками: ${users.filter((u) => u.subscriptions.length > 0).length}`,
        parse_mode: "HTML",
      }
    );

    // Возвращаем успешный ответ
    res.json({
      success: true,
      message: "Excel файл успешно отправлен в Telegram",
      data: {
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.isActive).length,
        adminUsers: users.filter((u) => u.isAdmin).length,
        usersWithSubscriptions: users.filter((u) => u.subscriptions.length > 0)
          .length,
        fileName,
        exportDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Ошибка при отправке файла через бота:", error);
    throw new ValidationError("Не удалось отправить файл через Telegram бота");
  }
});
