import { RequestHandler } from "express";
import {
  uploadFile,
  getSignedFileUrl,
  deleteFile,
  listFiles,
} from "@/services/uploader.service";
import {
  MulterFile,
  FileUrlResponse,
  FileDeleteResponse,
  FileListResponse,
} from "@/types/file";
import {
  isValidFileType,
  isValidFileSize,
  formatFileSize,
} from "@/utils/fileUtils";

export const uploadFileHandler: RequestHandler = async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ error: "Файл не предоставлен" });
      return;
    }

    const file = req.files[0] as MulterFile;
    const { buffer, originalname, mimetype, size } = file;

    if (!isValidFileType(mimetype)) {
      res.status(400).json({
        error: "Недопустимый тип файла",
        allowedTypes: [
          "image/jpeg",
          "image/png",
          "image/gif",
          "video/mp4",
          "video/quicktime",
        ],
      });
      return;
    }

    if (!isValidFileSize(size)) {
      res.status(400).json({
        error: "Превышен максимальный размер файла",
        maxSize: formatFileSize(100 * 1024 * 1024),
      });
      return;
    }

    const key = await uploadFile(buffer, originalname, mimetype);
    const url = await getSignedFileUrl(key);

    res.json({
      success: true,
      key,
      url,
      filename: originalname,
      size,
      mimeType: mimetype,
      uploadDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Ошибка при загрузке файла:", error);
    res.status(500).json({ error: "Не удалось загрузить файл" });
  }
};

export const getFileUrlHandler: RequestHandler = async (req, res) => {
  try {
    const { key } = req.params;
    const url = await getSignedFileUrl(key);

    const response: FileUrlResponse = { url };
    res.json(response);
  } catch (error) {
    console.error("Ошибка при получении файла:", error);
    res.status(500).json({ error: "Не удалось получить файл" });
  }
};

export const deleteFileHandler: RequestHandler = async (req, res) => {
  try {
    const { key } = req.params;
    await deleteFile(key);

    const response: FileDeleteResponse = {
      success: true,
      message: "Файл успешно удален",
    };
    res.json(response);
  } catch (error) {
    console.error("Ошибка при удалении файла:", error);
    res.status(500).json({ error: "Не удалось удалить файл" });
  }
};

export const listFilesHandler: RequestHandler = async (req, res) => {
  try {
    const { prefix } = req.query;
    const files = await listFiles((prefix as string) || "");

    const response: FileListResponse = { files };
    res.json(response);
  } catch (error) {
    console.error("Ошибка при получении списка файлов:", error);
    res.status(500).json({ error: "Не удалось получить список файлов" });
  }
};
