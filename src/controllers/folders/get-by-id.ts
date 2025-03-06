import { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { NotFoundError } from "@/utils/errors/AppError";
import { prisma } from "@/prisma/prismaClient";

export const getFolderById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const folder = await prisma.folder.findUnique({
      where: { id },
      include: { topics: true },
    });

    if (!folder) {
      throw new NotFoundError("Folder not found");
    }

    res.json(folder);
  }
);
