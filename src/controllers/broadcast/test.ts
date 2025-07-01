import { asyncHandler } from "@/middleware/asyncHandler";
import { ValidationError } from "@/utils/errors/AppError";
import { Request, Response } from "express";
import { broadcastService } from "@/bot/core";
import { MessageSettings } from "@/bot/broadcast/types";

export const testBroadcast = asyncHandler(
  async (req: Request, res: Response) => {
    const { text, buttonText, buttonUrl, imageUrl } = req.body;
    console.log(text, buttonText, buttonUrl, imageUrl);

    if (!text || text.trim() === "") {
      throw new ValidationError("Текст сообщения обязателен");
    }

    if (buttonText && !buttonUrl) {
      throw new ValidationError(
        "Если указан текст кнопки, необходимо указать ссылку"
      );
    }

    if (buttonUrl && !buttonText) {
      throw new ValidationError(
        "Если указана ссылка, необходимо указать текст кнопки"
      );
    }

    if (!req.user?.isActive) {
      throw new ValidationError("Пользователь не активен");
    }

    if (!req.user.chatId) {
      throw new ValidationError(
        "У пользователя нет chatId для отправки сообщения"
      );
    }

    try {
      // Подготавливаем настройки сообщения
      const messageSettings: MessageSettings = {
        text,
        photo: imageUrl || undefined,
        buttonText: buttonText || undefined,
        buttonUrl: buttonUrl || undefined,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      };

      await broadcastService.sendMessage(
        Number(req.user.chatId),
        messageSettings
      );

      res.json({
        success: true,
        message: "Тестовое сообщение отправлено",
        data: {
          recipient: {
            id: req.user.id,
            username: req.user.username,
            chatId: req.user.chatId,
          },
          messageSettings,
        },
      });
    } catch (error) {
      console.error("Ошибка отправки тестового сообщения:", error);
      throw new ValidationError(
        `Не удалось отправить тестовое сообщение: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`
      );
    }
  }
);
