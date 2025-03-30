import { Router } from "express";
import {
  uploadFileHandler,
  getFileUrlHandler,
  deleteFileHandler,
  listFilesHandler,
} from "./fileController";
import upload from "@/middleware/upload";

const router = Router();

router.post("/upload", upload.any(), uploadFileHandler);
router.get("/file/:key", getFileUrlHandler);
router.delete("/file/:key", deleteFileHandler);
router.get("/files", listFilesHandler);

export default router;
