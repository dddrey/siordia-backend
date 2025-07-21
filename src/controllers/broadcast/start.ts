import { asyncHandler } from "@/middleware/asyncHandler";
import { Request, Response } from "express";
import { broadcastManagementService } from "@/services/broadcast.service";
import { ValidationError } from "@/utils/errors/AppError";

export const startBroadcast = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ValidationError("ID рассылки обязателен");
    }

    const result = await broadcastManagementService.startBroadcast(id);

    res.json({
      success: true,
      message: "Рассылка запущена",
      data: {
        successCount: result.successCount,
        errorCount: result.errorCount,
        totalUsers: result.totalUsers,
      },
    });
  }
);
