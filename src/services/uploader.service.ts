import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand,
  ListObjectsCommandOutput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import { R2Error, R2FileInfo } from "@/types/file";

dotenv.config();

// Проверка наличия необходимых переменных окружения
if (
  !process.env.R2_ACCOUNT_ID ||
  !process.env.R2_ACCESS_KEY_ID ||
  !process.env.R2_SECRET_ACCESS_KEY ||
  !process.env.R2_BUCKET_NAME
) {
  throw new Error("Отсутствуют необходимые переменные окружения для R2");
}

// Конфигурация клиента S3 для Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.R2_BUCKET_NAME;

/**
 * Загрузка файла в R2 бакет
 * @param fileBuffer - Буфер файла
 * @param fileName - Имя файла
 * @param contentType - MIME-тип файла
 * @returns Ключ загруженного файла
 */
async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    const key = `${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return key;
  } catch (error) {
    const r2Error = error as R2Error;
    console.error("Детали ошибки R2:", {
      message: r2Error.message,
      code: r2Error.Code,
      bucket: bucketName,
      accountId: process.env.R2_ACCOUNT_ID,
      metadata: r2Error.$metadata,
    });
    throw error;
  }
}

/**
 * Получение временной ссылки на файл
 * @param key - Ключ файла
 * @param expiresIn - Время жизни ссылки в секундах
 * @returns Временная ссылка на файл
 */
async function getSignedFileUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Удаление файла из бакета
 * @param key - Ключ файла
 */
async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Получение списка файлов
 * @param prefix - Префикс для фильтрации файлов
 * @returns Список файлов
 */
async function listFiles(prefix: string = ""): Promise<R2FileInfo[]> {
  const command = new ListObjectsCommand({
    Bucket: bucketName,
    Prefix: prefix,
  });

  const response: ListObjectsCommandOutput = await s3Client.send(command);
  return response.Contents || [];
}

export { uploadFile, getSignedFileUrl, deleteFile, listFiles };
