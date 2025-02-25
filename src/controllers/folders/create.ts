import { asyncHandler } from "@/middleware/asyncHandler";
import { prisma } from "@/prisma/prismaClient";
import { ValidationError } from "@/utils/errors/AppError";
import { ContentType } from "@prisma/client";
import { Request, Response } from "express";

export const createFolder = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, type, description, about } = req.body;

    if (!name || !type) {
      throw new ValidationError("Name and type are required");
    }

    if (!Object.values(ContentType).includes(type as ContentType)) {
      throw new ValidationError("Invalid type");
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        type,
        description,
        about,
      },
    });

    res.status(201).json(folder);
  }
);
