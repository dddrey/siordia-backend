import { asyncHandler } from "@/middleware/asyncHandler";
import { Request, Response } from "express";
import { broadcastManagementService } from "@/services/broadcast.service";
import { ValidationError } from "@/utils/errors/AppError";

// Функция для проверки валидности URL
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const updateBroadcast = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      name,
      text,
      buttonText,
      buttonUrl,
      imageUrl,
      delayMs,
      skipInactive,
      retryOnRateLimit,
    } = req.body;

    if (!id) {
      throw new ValidationError("ID рассылки обязателен");
    }

    // Валидация текста (если передан)
    if (text !== undefined && (!text || text.trim() === "")) {
      throw new ValidationError("Текст сообщения не может быть пустым");
    }

    // Валидация кнопки
    if (buttonText !== undefined && buttonText.trim() !== "") {
      if (!buttonUrl || buttonUrl.trim() === "") {
        throw new ValidationError(
          "Если указан текст кнопки, необходимо указать ссылку"
        );
      }
      if (!isValidUrl(buttonUrl)) {
        throw new ValidationError("Некорректная ссылка для кнопки");
      }
    }

    if (
      buttonUrl !== undefined &&
      buttonUrl.trim() !== "" &&
      (!buttonText || buttonText.trim() === "")
    ) {
      throw new ValidationError(
        "Если указана ссылка, необходимо указать текст кнопки"
      );
    }

    // Валидация изображения
    if (
      imageUrl !== undefined &&
      imageUrl.trim() !== "" &&
      !isValidUrl(imageUrl)
    ) {
      throw new ValidationError("Некорректная ссылка для изображения");
    }

    // Валидация числовых параметров
    if (delayMs !== undefined && (typeof delayMs !== "number" || delayMs < 0)) {
      throw new ValidationError("Задержка должна быть положительным числом");
    }

    try {
      const updatedBroadcast = await broadcastManagementService.updateBroadcast(
        id,
        {
          name,
          text,
          buttonText:
            buttonText !== undefined && buttonText.trim() === ""
              ? null
              : buttonText,
          buttonUrl:
            buttonUrl !== undefined && buttonUrl.trim() === ""
              ? null
              : buttonUrl,
          imageUrl:
            imageUrl !== undefined && imageUrl.trim() === "" ? null : imageUrl,
          delayMs,
          skipInactive,
          retryOnRateLimit,
        }
      );

      return res.json(updatedBroadcast);
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(error.message);
      }
      throw new ValidationError("Ошибка при обновлении рассылки");
    }
  }
);
