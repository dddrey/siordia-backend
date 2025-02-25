import { asyncHandler } from "@/middleware/asyncHandler";
import { prisma } from "@/prisma/prismaClient";
import { NotFoundError } from "@/utils/errors/AppError";
import { Request, Response } from "express";

export const deleteTopic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingTopic = await prisma.topic.findUnique({
    where: { id },
  });

  if (!existingTopic) {
    throw new NotFoundError("Topic not found");
  }

  await prisma.$transaction([
    prisma.lesson.deleteMany({
      where: { topicId: id },
    }),
    prisma.topic.delete({
      where: { id },
    }),
  ]);

  res.status(204).send();
});
