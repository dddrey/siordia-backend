import express from "express";
import { authenticateUser } from "@/controllers/auth/authenticate";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Авторизация
 */

router.post("/", authenticateUser);

export default router;
