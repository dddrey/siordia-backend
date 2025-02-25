import { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { ValidationError } from "@/utils/errors/AppError";
import { prisma } from "@/prisma/prismaClient";
import { ContentType, Prisma } from "@prisma/client";

export const getFolders = asyncHandler(async (req: Request, res: Response) => {
  const type = req.query.type as string | undefined;

  const queryOptions: Prisma.FolderFindManyArgs = {
    include: {
      topics: true,
    },
  };

  if (type) {
    if (!Object.values(ContentType).includes(type as ContentType)) {
      throw new ValidationError("Invalid type");
    }
    queryOptions.where = {
      type: type as ContentType,
    };
  }
  const folders = await prisma.folder.findMany(queryOptions);
  res.json(folders);
});
