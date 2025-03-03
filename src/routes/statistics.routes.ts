import { Router } from "express";
import { getStatistics } from "../controllers/statistics/get";
import { isAdmin } from "@/middleware/isAdmin";

const router = Router();

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
router.get("/", isAdmin, getStatistics);

export default router;
