import { updateUser } from "@/controllers/user/update";
import { getAllUsers } from "@/controllers/user/getAllUsers";
import { exportUsers } from "@/controllers/user/exportUsers";
import { isAdmin } from "@/middleware/isAdmin";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Пользователи
 */

/**
 * @swagger
 * /api/users/all:
 *   get:
 *     summary: Получить всех пользователей с пагинацией (только для админов)
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Количество пользователей на странице
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Поиск по имени пользователя или ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, username, registrationDate, isActive]
 *           default: createdAt
 *         description: Поле для сортировки
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Порядок сортировки
 *     responses:
 *       200:
 *         description: Список пользователей успешно получен
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав доступа (не админ)
 *       400:
 *         description: Неверные параметры пагинации
 */
router.get("/", isAdmin, getAllUsers);

/**
 * @swagger
 * /api/users/export:
 *   get:
 *     summary: Экспорт всех пользователей в Excel файл через Telegram бота (только для админов)
 *     description: Генерирует Excel файл со всеми пользователями и отправляет его админу в Telegram. Файл содержит подробную информацию о пользователях включая подписки и статистику.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Excel файл успешно отправлен в Telegram админу
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Excel файл успешно отправлен в Telegram"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       description: Общее количество пользователей
 *                       example: 150
 *                     activeUsers:
 *                       type: integer
 *                       description: Количество активных пользователей
 *                       example: 120
 *                     adminUsers:
 *                       type: integer
 *                       description: Количество админов
 *                       example: 3
 *                     usersWithSubscriptions:
 *                       type: integer
 *                       description: Количество пользователей с подписками
 *                       example: 85
 *                     fileName:
 *                       type: string
 *                       description: Имя созданного файла
 *                       example: "users_export_2024-01-15.xlsx"
 *                     exportDate:
 *                       type: string
 *                       format: date-time
 *                       description: Дата и время экспорта
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав доступа (не админ)
 *       400:
 *         description: У пользователя нет chatId для отправки файла
 *       500:
 *         description: Ошибка при отправке файла через Telegram бота
 */
router.get("/export", isAdmin, exportUsers);

router.put("/", updateUser);

export default router;
