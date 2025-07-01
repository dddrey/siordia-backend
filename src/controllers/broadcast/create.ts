import { asyncHandler } from "@/middleware/asyncHandler";
import { Request, Response } from "express";
import { broadcastManagementService } from "@/services/broadcast.service";
import { ValidationError } from "@/utils/errors/AppError";

export const createBroadcast = asyncHandler(
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

    const broadcast = await broadcastManagementService.createBroadcast({
      text,
      buttonText,
      buttonUrl,
      imageUrl,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: broadcast.id,
        status: broadcast.status,
        text: broadcast.text,
        buttonText: broadcast.buttonText,
        buttonUrl: broadcast.buttonUrl,
        createdAt: broadcast.createdAt,
      },
    });
  }
);
