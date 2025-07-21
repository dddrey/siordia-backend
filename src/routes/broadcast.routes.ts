import {
  createBroadcast,
  getBroadcastStatus,
  startBroadcast,
  getAllBroadcasts,
  testBroadcast,
  updateBroadcast,
  deleteBroadcast,
  getBroadcastById,
} from "@/controllers/broadcast";
import { isAdmin } from "@/middleware/isAdmin";
import { Router } from "express";

const router = Router();

// Создание рассылки
router.post("/", isAdmin, createBroadcast);

// Получение всех рассылок
router.get("/", isAdmin, getAllBroadcasts);

// Получение рассылки по ID
router.get("/:id", isAdmin, getBroadcastById);

// Обновление рассылки
router.put("/:id", isAdmin, updateBroadcast);

// Удаление рассылки
router.delete("/:id", isAdmin, deleteBroadcast);

// Запуск рассылки
router.post("/:id/start", isAdmin, startBroadcast);

// Получение статуса рассылки
router.get("/:id/status", isAdmin, getBroadcastStatus);

// Тестовая рассылка
router.post("/test", isAdmin, testBroadcast);

export default router;
