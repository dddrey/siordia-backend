import { asyncHandler } from "@/middleware/asyncHandler";
import { prisma } from "@/prisma/prismaClient";
import { ValidationError } from "@/utils/errors/AppError";
import { Request, Response } from "express";

export const createTopic = asyncHandler(async (req: Request, res: Response) => {
  const { name, about, description, folderId } = req.body;

  if (!name || !folderId) {
    throw new ValidationError("Name and folderId are required");
  }

  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
  });

  if (!folder) {
    throw new ValidationError(`Folder with ID ${folderId} not found`);
  }

  const topic = await prisma.topic.create({
    data: {
      name,
      about,
      description,
      folderId,
      type: folder.type,
    },
    include: {
      folder: true,
    },
  });

  res.status(201).json(topic);
});
