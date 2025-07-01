export interface MessageSettings {
  text: string;
  photo?: string; // URL фото или file_id
  buttonText?: string; // текст кнопки
  buttonUrl?: string; // ссылка для кнопки
  // Дополнительные настройки для будущего:
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  disable_web_page_preview?: boolean;
}

export interface BroadcastResult {
  successCount: number;
  errorCount: number;
  totalUsers: number;
  errors: string[];
}

export interface BroadcastOptions {
  delayMs?: number; // задержка между сообщениями в миллисекундах
  skipInactive?: boolean; // пропускать неактивных пользователей
  retryOnRateLimit?: boolean; // повторять при превышении лимита
}
