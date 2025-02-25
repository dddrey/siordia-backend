import { asyncHandler } from "@/middleware/asyncHandler";
import { prisma } from "@/prisma/prismaClient";
import { NotFoundError } from "@/utils/errors/AppError";
import { Request, Response } from "express";

export const deleteLesson = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const lesson = await prisma.lesson.findUnique({ where: { id } });

    if (!lesson) {
      throw new NotFoundError("Lesson not found");
    }

    await prisma.lesson.delete({ where: { id } });

    res.status(204).send();
  }
);
