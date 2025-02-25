import { asyncHandler } from "@/middleware/asyncHandler";
import { ForbiddenError, NotFoundError } from "@/utils/errors/AppError";
import { prisma } from "@/prisma/prismaClient";
import { Request, Response } from "express";
import { hasActiveSubscription } from "@/utils/subscription/index";

export const getLessonById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const currentLesson = await prisma.lesson.findUnique({
      where: { id },
      include: { topic: true },
    });

    if (!currentLesson) {
      throw new NotFoundError("Lesson not found");
    }

    const isHavePermission = hasActiveSubscription(req, currentLesson.type);

    if (currentLesson.isSubscriptionRequired && !isHavePermission) {
      throw new ForbiddenError(
        "You need an active subscription to access this lesson"
      );
    }

    await prisma.lesson.update({
      where: { id },
      data: { views: currentLesson.views + 1 },
    });

    const [previousLesson, nextLesson] = await Promise.all([
      prisma.lesson.findFirst({
        where: {
          topicId: currentLesson.topicId,
          orderNumber: { lt: currentLesson.orderNumber },
        },
        orderBy: { orderNumber: "desc" },
        select: { id: true },
      }),
      prisma.lesson.findFirst({
        where: {
          topicId: currentLesson.topicId,
          orderNumber: { gt: currentLesson.orderNumber },
        },
        orderBy: { orderNumber: "asc" },
        select: { id: true },
      }),
    ]);

    res.json({
      lesson: currentLesson,
      previousLessonId: previousLesson?.id || null,
      nextLessonId: nextLesson?.id || null,
    });
  }
);
