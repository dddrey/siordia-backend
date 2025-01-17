import express, { Request, Response } from "express";
import { authenticateUser } from "../controllers/auth.controller";
const router = express.Router();

router.post("/auth", async (req: Request, res: Response) => {
  await authenticateUser(req, res);
});

export default router;