import { asyncHandler } from "@/middleware/asyncHandler";
import { Request, Response } from "express";
import { prisma } from "@/prisma/prismaClient";
import { ValidationError } from "@/utils/errors/AppError";

interface GetAllUsersQuery {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: "createdAt" | "username" | "registrationDate" | "isActive";
  sortOrder?: "asc" | "desc";
}

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = "1",
    limit = "10",
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  }: GetAllUsersQuery = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    throw new ValidationError("Invalid pagination parameters");
  }

  const skip = (pageNum - 1) * limitNum;

  // Строим условие поиска
  const where = search
    ? {
        OR: [
          {
            username: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            id: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  // Строим условие сортировки
  const orderBy = {
    [sortBy]: sortOrder,
  };

  // Получаем пользователей и общее количество
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy,
      include: {
        subscriptions: {
          where: {
            active: true,
          },
          select: {
            id: true,
            type: true,
            endDate: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
    meta: {
      sortBy,
      sortOrder,
      search: search || null,
    },
  });
});
