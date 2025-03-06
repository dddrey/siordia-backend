"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_1 = require("../controllers/statistics/get");
const isAdmin_1 = require("../middleware/isAdmin");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: Получить статистику (только для админов)
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика успешно получена
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав доступа
 */
router.get("/", isAdmin_1.isAdmin, get_1.getStatistics);
exports.default = router;
