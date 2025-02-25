import { asyncHandler } from "@/middleware/asyncHandler";
import { NotFoundError } from "@/utils/errors/AppError";
import { prisma } from "@/prisma/prismaClient";
import { Request, Response } from "express";

export const updateLesson = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      name,
      video,
      about,
      description,
      tasks,
      isSubscriptionRequired,
      orderNumber,
      topicId,
    } = req.body;

    const existingLesson = await prisma.lesson.findUnique({
      where: { id },
      include: { topic: { include: { folder: true } } },
    });

    if (!existingLesson) {
      throw new NotFoundError("Lesson not found");
    }

    let type = existingLesson.type;

    if (topicId && topicId !== existingLesson.topicId) {
      const newTopic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: { folder: true },
      });

      if (!newTopic) {
        throw new NotFoundError("New topic not found");
      }

      type = newTopic.folder.type;
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: {
        name,
        video,
        about,
        description,
        tasks,
        isSubscriptionRequired,
        orderNumber,
        topicId,
        type,
      },
      include: { topic: { include: { folder: true } } },
    });

    res.json(updatedLesson);
  }
);
