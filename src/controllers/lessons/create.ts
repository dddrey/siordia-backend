import { asyncHandler } from "@/middleware/asyncHandler";
import { NotFoundError } from "@/utils/errors/AppError";
import { ValidationError } from "@/utils/errors/AppError";
import { prisma } from "@/prisma/prismaClient";
import { Request, Response } from "express";

export const createLesson = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      video,
      about,
      description,
      tasks,
      isSubscriptionRequired,
      topicId,
    } = req.body;

    if (!name || !video || !topicId) {
      throw new ValidationError("Name, video and topicId are required");
    }

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: { folder: true },
    });

    if (!topic) {
      throw new NotFoundError("Topic not found");
    }

    const lastLesson = await prisma.lesson.findFirst({
      where: { topicId },
      orderBy: { orderNumber: "desc" },
    });

    const nextOrderNumber = (lastLesson?.orderNumber || 0) + 1;

    const lesson = await prisma.lesson.create({
      data: {
        name,
        video,
        about,
        description,
        tasks: tasks || [],
        orderNumber: nextOrderNumber,
        isSubscriptionRequired: isSubscriptionRequired ?? true,
        type: topic.folder.type,
        topicId,
      },
      include: {
        topic: {
          include: {
            folder: true,
          },
        },
      },
    });

    res.status(201).json(lesson);
  }
);
