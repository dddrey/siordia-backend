/**
 * Генерирует уникальное имя файла
 * @param originalName - Оригинальное имя файла
 * @returns Уникальное имя файла
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  
  return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Проверяет допустимость типа файла
 * @param mimeType - MIME-тип файла
 * @param allowedTypes - Массив разрешенных MIME-типов
 * @returns true, если тип файла допустим
 */
export function isValidFileType(
  mimeType: string, 
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime']
): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Проверяет размер файла
 * @param size - Размер файла в байтах
 * @param maxSize - Максимальный размер файла в байтах (по умолчанию 100MB)
 * @returns true, если размер файла не превышает максимальный
 */
export function isValidFileSize(size: number, maxSize: number = 100 * 1024 * 1024): boolean {
  return size <= maxSize;
}

/**
 * Форматирует размер файла для отображения
 * @param bytes - Размер файла в байтах
 * @returns Отформатированный размер файла
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
} 