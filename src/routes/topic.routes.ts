import { Router } from "express";
import { isAdmin } from "@/middleware/isAdmin";
import {
  getTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
} from "@/controllers/topics/index";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Topics
 *   description: Темы
 */

router.get("/", getTopics);
router.get("/:id", getTopicById);

router.post("/", isAdmin, createTopic);
router.put("/:id", isAdmin, updateTopic);
router.delete("/:id", isAdmin, deleteTopic);

export default router;
