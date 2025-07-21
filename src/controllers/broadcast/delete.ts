import { asyncHandler } from "@/middleware/asyncHandler";
import { Request, Response } from "express";
import { broadcastManagementService } from "@/services/broadcast.service";
import { ValidationError } from "@/utils/errors/AppError";

export const deleteBroadcast = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ValidationError("ID рассылки обязателен");
    }

    try {
      const result = await broadcastManagementService.deleteBroadcast(id);

      return res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(error.message);
      }
      throw new ValidationError("Ошибка при удалении рассылки");
    }
  }
);
