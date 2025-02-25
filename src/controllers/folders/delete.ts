import { asyncHandler } from "@/middleware/asyncHandler";
import { prisma } from "@/prisma/prismaClient";
import { NotFoundError, ValidationError } from "@/utils/errors/AppError";
import { Request, Response } from "express";

export const deleteFolder = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log(id);

    if (!id) {
      throw new ValidationError("Id is required");
    }

    const folder = await prisma.folder.delete({
      where: { id },
    });

    if (!folder) {
      throw new NotFoundError("Folder not found");
    }

    res.status(204).send();
  }
);
