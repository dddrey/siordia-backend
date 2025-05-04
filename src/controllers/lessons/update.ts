import { asyncHandler } from "@/middleware/asyncHandler";
import { NotFoundError } from "@/utils/errors/AppError";
import { prisma } from "@/prisma/prismaClient";
import { Request, Response } from "express";
import { uploadFile, deleteFile } from "@/services/uploader.service";

export const updateLesson = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      name,
      about,
      description,
      tasks,
      isSubscriptionRequired,
      orderNumber,
      topicId,
    } = req.body;

    console.log(typeof tasks);

    const isSubscriptionRequiredBool = isSubscriptionRequired === "true";

    const existingLesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        topic: { include: { folder: true } },
      },
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

    // Обрабатываем видео только если пришел новый файл
    if (req.file) {
      // Удаляем старое видео из storage
      await deleteFile(existingLesson.videoId);

      // Загружаем новое видео и получаем новый videoId
      const newVideoId = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      // Обновляем урок с новым videoId
      const updatedLesson = await prisma.lesson.update({
        where: { id },
        data: {
          name,
          about,
          description,
          tasks,
          isSubscriptionRequired: isSubscriptionRequiredBool,
          orderNumber,
          topicId,
          type,
          videoId: newVideoId,
        },
        include: {
          topic: { include: { folder: true } },
        },
      });

      return res.json(updatedLesson);
    }

    // Если новый файл не пришел, обновляем урок без изменения videoId
    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: {
        name,
        about,
        description,
        tasks,
        isSubscriptionRequired: isSubscriptionRequiredBool,
        orderNumber,
        topicId,
        type,
      },
      include: {
        topic: { include: { folder: true } },
      },
    });

    res.json(updatedLesson);
  }
);
