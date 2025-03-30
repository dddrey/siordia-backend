/**
 * Интерфейс для файла, загруженного через multer
 */
export interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
  encoding?: string;
  fieldname?: string;
}

/**
 * Интерфейс для ответа при загрузке файла
 */
export interface FileUploadResponse {
  success: boolean;
  key: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadDate: string;
}

/**
 * Интерфейс для ответа при получении URL файла
 */
export interface FileUrlResponse {
  url: string;
}

/**
 * Интерфейс для ответа при удалении файла
 */
export interface FileDeleteResponse {
  success: boolean;
  message: string;
}

/**
 * Интерфейс для ответа при получении списка файлов
 */
export interface FileListResponse {
  files: R2FileInfo[];
}

/**
 * Интерфейс для информации о файле в R2
 */
export interface R2FileInfo {
  Key?: string;
  LastModified?: Date;
  ETag?: string;
  Size?: number;
  StorageClass?: string;
}

/**
 * Интерфейс для ошибки R2
 */
export interface R2Error extends Error {
  Code?: string;
  $metadata?: {
    httpStatusCode?: number;
    requestId?: string;
    attempts?: number;
    totalRetryDelay?: number;
  };
} 