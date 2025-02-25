import { asyncHandler } from "@/middleware/asyncHandler";
import { prisma } from "@/prisma/prismaClient";
import { NotFoundError } from "@/utils/errors/AppError";
import { Request, Response } from "express";

export const getTopics = asyncHandler(async (req: Request, res: Response) => {
  const { folderId } = req.query;

  if (folderId) {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId as string },
    });
    if (!folder) {
      throw new NotFoundError("Folder not found");
    }
  }

  const topics = await prisma.topic.findMany({
    where: folderId ? { folderId: folderId as string } : undefined,
    include: {
      folder: true,
      lessons: {
        orderBy: {
          orderNumber: "asc",
        },
      },
    },
  });

  res.json(topics);
});
