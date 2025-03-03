"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const isAdmin_1 = require("../middleware/isAdmin");
const index_1 = require("../controllers/lessons/index");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Lessons
 *   description: Уроки
 */
router.get("/", index_1.getLessons);
router.get("/:id", index_1.getLessonById);
router.post("/", isAdmin_1.isAdmin, index_1.createLesson);
router.put("/:id", isAdmin_1.isAdmin, index_1.updateLesson);
router.delete("/:id", isAdmin_1.isAdmin, index_1.deleteLesson);
exports.default = router;
