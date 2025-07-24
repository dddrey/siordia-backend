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
 *     summary: Экспорт всех пользователей в Excel файл (только для админов)
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Excel файл успешно сгенерирован
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав доступа (не админ)
 *       500:
 *         description: Ошибка сервера при генерации файла
 */
router.get("/export", isAdmin, exportUsers);

router.put("/", updateUser);

export default router;
