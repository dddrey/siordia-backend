import { asyncHandler } from "@/middleware/asyncHandler";
import { Request, Response } from "express";
import { prisma } from "@/prisma/prismaClient";
import * as XLSX from "xlsx";

export const exportUsers = asyncHandler(async (req: Request, res: Response) => {
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

  // Устанавливаем заголовки для скачивания файла
  const fileName = `users_export_${new Date().toISOString().split("T")[0]}.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Length", excelBuffer.length);

  // Отправляем файл
  res.send(excelBuffer);
});
