import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { NotFoundError, ValidationError } from '../utils/errors/AppError';
import prisma from '../prisma/prismaClient';
import { ContentType, Prisma } from '@prisma/client';

export const getFolderById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const folder = await prisma.folder.findUnique({
    where: { id },
    include: { topics: true },
  });
  if (!folder) {
    throw new NotFoundError('Folder not found');
  }
  res.json(folder);
});

export const getFolders = asyncHandler(async (req: Request, res: Response) => {
 const type = req.query.type as string | undefined;

  const queryOptions: Prisma.FolderFindManyArgs = {
   include: {
     topics: true,
   },
 };

  if (type) {
    if (!Object.values(ContentType).includes(type as ContentType)) {
      throw new ValidationError('Invalid type');
    }
      queryOptions.where = {
      type: type as ContentType
    };
  }
  const folders = await prisma.folder.findMany(queryOptions);
  res.json(folders);
});

export const createFolder = asyncHandler(async (req: Request, res: Response) => {
  const { name, type, description, about } = req.body;

  if (!name || !type) {
    throw new ValidationError('Name and type are required');
  }

  if (!Object.values(ContentType).includes(type as ContentType)) {
    throw new ValidationError('Invalid type');
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
});

export const updateFolder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, type, description, about } = req.body;

  if (!name || !type) {
    throw new ValidationError('Name and type are required');
  }

  if (!Object.values(ContentType).includes(type as ContentType)) {
    throw new ValidationError('Invalid type');
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
    throw new NotFoundError('Folder not found');
  }

  res.json(folder);
});

export const deleteFolder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Id is required');
  }

  const folder = await prisma.folder.delete({
    where: { id },
  });

  if (!folder) {
    throw new NotFoundError('Folder not found');
  }

  res.status(204).send();
});
