"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const isAdmin_1 = require("../middleware/isAdmin");
const index_1 = require("../controllers/topics/index");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Topics
 *   description: Темы
 */
router.get("/", index_1.getTopics);
router.get("/:id", index_1.getTopicById);
router.post("/", isAdmin_1.isAdmin, index_1.createTopic);
router.put("/:id", isAdmin_1.isAdmin, index_1.updateTopic);
router.delete("/:id", isAdmin_1.isAdmin, index_1.deleteTopic);
exports.default = router;
