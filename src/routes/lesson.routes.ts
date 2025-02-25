import { Router } from "express";
import { isAdmin } from "@/middleware/isAdmin";

import {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/controllers/lessons/index";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Lessons
 *   description: Уроки
 */

router.get("/", getLessons);
router.get("/:id", getLessonById);
router.post("/", isAdmin, createLesson);
router.put("/:id", isAdmin, updateLesson);
router.delete("/:id", isAdmin, deleteLesson);

export default router;
