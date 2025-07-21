import { asyncHandler } from "@/middleware/asyncHandler";
import { Request, Response } from "express";
import { prisma } from "@/prisma/prismaClient";
import { ValidationError } from "@/utils/errors/AppError";

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ValidationError("User not found");
  }

  const { id: userId, chatId } = req.user;

  if (!userId) {
    throw new ValidationError("User ID not found");
  }

  if (!chatId) {
    throw new ValidationError("Chat ID not found");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      registrationDate: new Date(),
    },
  });

  res.json(user);
});
