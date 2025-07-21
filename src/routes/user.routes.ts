import { updateUser } from "@/controllers/user/update";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Topics
 *   description: Темы
 */

router.put("/", updateUser);

export default router;
