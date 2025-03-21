import { Router } from "express";
import { createSubscription } from "@/controllers/subscriptions/index";
import { createPayment } from "@/controllers/payment/create";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: Подписки
 */

router.post("/", createSubscription);

router.post("/payment", createPayment);

export default router;
