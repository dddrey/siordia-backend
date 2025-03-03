import { authenticateUser } from "@/controllers/auth/authenticate";
import express from "express";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Авторизация
 */

router.post("/", authenticateUser);

export default router;
