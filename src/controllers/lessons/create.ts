import { asyncHandler } from "@/middleware/asyncHandler";
import { prisma } from "@/prisma/prismaClient";
import { uploadFile } from "@/services/uploader.service";
import { ValidationError } from "@/utils/errors/AppError";
import { isValidFileSize, isValidFileType } from "@/utils/fileUtils";
import { Request, Response } from "express";
import multer from "multer";

// Настраиваем multer для временного хранения в памяти
const upload = multer();

export const createLesson = asyncHandler(
  async (req: Request, res: Response) => {
    // Оборачиваем в Promise для использования с asyncHandler
    await new Promise((resolve, reject) => {
      upload.single("video")(req, res, (err) => {
        if (err) reject(err);
        resolve(true);
      });
    });

    const { name, about, description, tasks, isSubscriptionRequired, topicId } =
      req.body;

    const parsedTasks = tasks ? JSON.parse(tasks) : [];

    console.log(typeof isSubscriptionRequired, isSubscriptionRequired);
    const isSubscriptionRequiredBool = isSubscriptionRequired === "true";

    if (!name || !topicId || !req.file) {
      throw new ValidationError("Name and topicId are required");
    }

    if (!isValidFileType(req.file.mimetype)) {
      throw new ValidationError("Недопустимый тип файла");
    }

    if (!isValidFileSize(req.file.size)) {
      throw new ValidationError("Превышен максимальный размер файла");
    }

    const key = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    const topic = await prisma.topic.findUnique({
      where: {
        id: topicId,
      },
      include: {
        lessons: true,
      },
    });

    if (!topic) {
      throw new ValidationError("Topic not found");
    }

    const orderNumber = topic.lessons.length;

    const lesson = await prisma.lesson.create({
      data: {
        name,
        about,
        description,
        tasks: parsedTasks,
        isSubscriptionRequired: isSubscriptionRequiredBool,
        topicId,
        videoId: key,
        orderNumber,
        type: topic.type,
      },
    });

    res.status(201).json(lesson);
  }
);
