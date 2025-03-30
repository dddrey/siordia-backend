import { asyncHandler } from "@/middleware/asyncHandler";
import { Request, Response } from "express";
import { getSignedFileUrl } from "@/services/uploader.service";
import { ForbiddenError, NotFoundError } from "@/utils/errors/AppError";
import { prisma } from "@/prisma/prismaClient";
import { hasActiveSubscription } from "@/utils/subscription";

export const getLessonVideoUrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    // По умолчанию ссылка действительна 1 час
    const { expiresIn = 3600 } = req.query;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      select: {
        videoId: true,
        isSubscriptionRequired: true,
        type: true,
      },
    });

    if (!lesson) {
      throw new NotFoundError("Lesson not found");
    }

    const isHavePermission = hasActiveSubscription(req, lesson.type);

    if (lesson.isSubscriptionRequired && !isHavePermission) {
      throw new ForbiddenError(
        "You need an active subscription to access this lesson"
      );
    }

    const videoUrl = await getSignedFileUrl(lesson.videoId);

    res.json({
      videoUrl,
      expiresIn: Number(expiresIn),
      generatedAt: new Date().toISOString(),
    });
  }
);
