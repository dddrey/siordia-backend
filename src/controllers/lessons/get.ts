import { prisma } from "@/prisma/prismaClient";
import { asyncHandler } from "@/middleware/asyncHandler";
import { Request, Response } from "express";

export const getLessons = asyncHandler(async (req: Request, res: Response) => {
  const topicId = req.query.topicId as string | undefined;

  if (!topicId) {
    const lessons = await prisma.lesson.findMany({
      include: {
        topic: {
          include: {
            folder: true,
          },
        },
      },
      orderBy: { orderNumber: "asc" },
    });
    res.json(lessons);
  } else {
    const lessons = await prisma.lesson.findMany({
      where: { topicId },
      include: {
        topic: {
          include: {
            folder: true,
          },
        },
      },
      orderBy: { orderNumber: "asc" },
    });
    res.json([
      ...lessons.filter((lesson) => lesson.isSubscriptionRequired === true),
      ...lessons.filter((lesson) => lesson.isSubscriptionRequired === false),
    ]);
  }
});
