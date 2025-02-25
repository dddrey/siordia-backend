import { Router } from "express";
import { createSubscription } from "@/controllers/subscriptions/index";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: Подписки
 */

router.post("/", createSubscription);

export default router;
