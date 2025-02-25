import { Request, Response } from "express";
import { prisma } from "@/prisma/prismaClient";
import { asyncHandler } from "@/middleware/asyncHandler";
import { UnauthorizedError } from "@/utils/errors/AppError";

export const authenticateUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { initData } = req;

    if (!initData) {
      throw new UnauthorizedError("User data not available");
    }

    let user = await prisma.user.findUnique({
      where: { id: initData.id },
      include: {
        subscriptions: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: initData.id,
          username: initData.username,
          avatarUrl: initData.photo_url || null,
        },
        include: {
          subscriptions: true,
        },
      });
    }

    return res.json(user);
  }
);
