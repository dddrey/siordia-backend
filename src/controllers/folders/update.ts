import { asyncHandler } from "@/middleware/asyncHandler";
import { prisma } from "@/prisma/prismaClient";
import { NotFoundError, ValidationError } from "@/utils/errors/AppError";
import { ContentType } from "@prisma/client";
import { Request, Response } from "express";

export const updateFolder = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, type, description, about } = req.body;

    if (!id) {
      throw new ValidationError("Id is required");
    }

    if (!name || !type) {
      throw new ValidationError("Name and type are required");
    }

    if (!Object.values(ContentType).includes(type as ContentType)) {
      throw new ValidationError("Invalid type");
    }

    const folder = await prisma.folder.update({
      where: { id },
      data: {
        name,
        type,
        description,
        about,
      },
    });

    if (!folder) {
      throw new NotFoundError("Folder not found");
    }

    res.json(folder);
  }
);
