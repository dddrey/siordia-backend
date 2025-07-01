import { asyncHandler } from "@/middleware/asyncHandler";
import { Request, Response } from "express";
import { ValidationError } from "@/utils/errors/AppError";
import { broadcastManagementService } from "@/services/broadcast.service";

export const getBroadcastStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ValidationError("ID рассылки обязателен");
    }

    const status = await broadcastManagementService.getBroadcastStatus(id);

    return res.json({
      success: true,
      data: status,
    });
  }
);
