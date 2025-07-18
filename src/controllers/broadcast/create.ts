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

export const createBroadcast = asyncHandler(
  async (req: Request, res: Response) => {
    const { text, buttonText, buttonUrl, fileId } = req.body;

    console.log(req.body);

    if (!text || text.trim() === "") {
      throw new ValidationError("Текст сообщения обязателен");
    }

    // Валидация кнопки
    if (buttonText && buttonText.trim() !== "") {
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
      buttonUrl &&
      buttonUrl.trim() !== "" &&
      (!buttonText || buttonText.trim() === "")
    ) {
      throw new ValidationError(
        "Если указана ссылка, необходимо указать текст кнопки"
      );
    }

    const broadcast = await broadcastManagementService.createBroadcast({
      text,
      buttonText:
        buttonText && buttonText.trim() !== "" ? buttonText : undefined,
      buttonUrl: buttonUrl && buttonUrl.trim() !== "" ? buttonUrl : undefined,
      fileId: fileId && fileId.trim() !== "" ? fileId : undefined,
    });

    return res.status(201).json(broadcast);
  }
);
