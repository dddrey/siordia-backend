import { ValidationError } from "@/utils/errors/AppError";
import { asyncHandler } from "@/middleware/asyncHandler";
import { Request, Response } from "express";
import { prisma } from "@/prisma/prismaClient";

export const getBroadcastById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ValidationError("ID рассылки обязателен");
    }

    const broadcast = await prisma.broadcast.findUnique({
      where: {
        id,
      },
    });

    return res.json(broadcast);
  }
);
