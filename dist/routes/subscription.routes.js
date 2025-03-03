"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../controllers/subscriptions/index");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: Подписки
 */
router.post("/", index_1.createSubscription);
exports.default = router;
