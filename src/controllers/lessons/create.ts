import { asyncHandler } from "@/middleware/asyncHandler";
import { ValidationError } from "@/utils/errors/AppError";
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

    console.log("Form fields:", req.body); // Все текстовые поля
    console.log("File details:", req.file); // Информация о файле

    const { name, about, description, tasks, isSubscriptionRequired, topicId } =
      req.body;

    console.log("Parsed fields:");
    console.log("name:", name);
    console.log("about:", about);
    console.log("description:", description);
    console.log("tasks:", tasks);
    console.log("isSubscriptionRequired:", isSubscriptionRequired);
    console.log("topicId:", topicId);
    console.log("File:", req.file);

    if (!name || !topicId || !req.file) {
      throw new ValidationError("Name and topicId are required");
    }

    res.status(201).json({
      success: true,
      data: {},
    });
  }
);
