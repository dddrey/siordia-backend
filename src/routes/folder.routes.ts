import { Router } from "express";
import { isAdmin } from "@/middleware/isAdmin";
import {
  getFolders,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder,
} from "@/controllers/folders/index";

/**
 * @swagger
 * tags:
 *   name: Folders
 *   description: Папки
 */

const router = Router();

router.get("/", getFolders);
router.get("/:id", getFolderById);

router.post("/", isAdmin, createFolder);
router.put("/:id", isAdmin, updateFolder);
router.delete("/:id", isAdmin, deleteFolder);

export default router;
