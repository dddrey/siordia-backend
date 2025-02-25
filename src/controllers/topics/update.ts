import { asyncHandler } from "@/middleware/asyncHandler";
import { prisma } from "@/prisma/prismaClient";
import { NotFoundError } from "@/utils/errors/AppError";
import { Request, Response } from "express";

export const updateTopic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, about, description, folderId } = req.body;

  const existingTopic = await prisma.topic.findUnique({
    where: { id },
  });

  if (!existingTopic) {
    throw new NotFoundError("Topic not found");
  }

  const updatedTopic = await prisma.topic.update({
    where: { id },
    data: {
      name,
      about,
      description,
      folderId,
    },
    include: {
      folder: true,
    },
  });

  res.json(updatedTopic);
});
