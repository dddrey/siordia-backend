import { Router } from "express";
import {
  createSubscription,
  adminGrantSubscription,
} from "@/controllers/subscriptions/index";
import { createPayment } from "@/controllers/payment/create";
import { checkExpiringSubscriptions } from "@/controllers/subscriptions/check-expiring";
import { getExpiringStats } from "@/controllers/subscriptions/get-expiring-stats";
import { isAdmin } from "@/middleware/isAdmin";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: Подписки
 */

router.post("/", createSubscription);

router.post("/payment", createPayment);

// Эндпоинт для выдачи подписок администратором (только для администраторов)
router.post("/admin-grant", isAdmin, adminGrantSubscription);

// Эндпоинт для получения статистики по истекающим подпискам (только для администраторов)
router.get("/expiring-stats", isAdmin, getExpiringStats);

// Эндпоинт для проверки истекающих подписок (только для администраторов)
router.post("/check-expiring", isAdmin, checkExpiringSubscriptions);

export default router;
