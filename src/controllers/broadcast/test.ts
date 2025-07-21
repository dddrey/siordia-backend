import { asyncHandler } from "@/middleware/asyncHandler";
import { ValidationError } from "@/utils/errors/AppError";
import { Request, Response } from "express";
import { broadcastService } from "@/bot/core";
import { MessageSettings } from "@/bot/broadcast/types";

export const testBroadcast = asyncHandler(
  async (req: Request, res: Response) => {
    const { text, buttonText, buttonUrl, fileId } = req.body;
    console.log(text, buttonText, buttonUrl, fileId);

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
      // Определяем тип файла по file_id (фото начинается с "AgAC", видео с "BAA")
      let messageSettings: MessageSettings;

      if (fileId) {
        // Для фото file_id обычно начинается с "AgAC", для видео с "BAA" или "BAAD"
        const isPhoto = fileId.startsWith("AgAC");
        const isVideo = fileId.startsWith("BAA");

        if (isPhoto) {
          messageSettings = {
            text,
            photo: fileId,
            buttonText: buttonText || undefined,
            buttonUrl: buttonUrl || undefined,
            parse_mode: "HTML",
            disable_web_page_preview: false,
          };
        } else if (isVideo) {
          messageSettings = {
            text,
            video: fileId,
            buttonText: buttonText || undefined,
            buttonUrl: buttonUrl || undefined,
            parse_mode: "HTML",
            disable_web_page_preview: false,
          };
        } else {
          // Если не можем определить тип, пробуем как фото
          messageSettings = {
            text,
            photo: fileId,
            buttonText: buttonText || undefined,
            buttonUrl: buttonUrl || undefined,
            parse_mode: "HTML",
            disable_web_page_preview: false,
          };
        }
      } else {
        // Обычное текстовое сообщение
        messageSettings = {
          text,
          buttonText: buttonText || undefined,
          buttonUrl: buttonUrl || undefined,
          parse_mode: "HTML",
          disable_web_page_preview: false,
        };
      }

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
