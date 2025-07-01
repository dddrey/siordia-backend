import {
  createBroadcast,
  getBroadcastStatus,
  startBroadcast,
  getAllBroadcasts,
  testBroadcast,
} from "@/controllers/broadcast";
import { isAdmin } from "@/middleware/isAdmin";
import { Router } from "express";

const router = Router();

router.post("/", isAdmin, createBroadcast);

router.post("/:id/start", isAdmin, startBroadcast);

router.get("/:id/status", isAdmin, getBroadcastStatus);

router.get("/", isAdmin, getAllBroadcasts);

router.post("/test", isAdmin, testBroadcast);

export default router;
