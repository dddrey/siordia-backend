import { Bot } from "grammy";

import { InlineKeyboard } from "grammy";
import { BroadcastOptions, BroadcastResult, MessageSettings } from "./types";
import { User } from "@prisma/client";

export class BroadcastService {
  private bot: Bot;
  private isRunning: boolean = false;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  /**
   * Основной метод для рассылки сообщений
   */
  async broadcast(
    users: User[],
    messageSettings: MessageSettings,
    options: BroadcastOptions = {}
  ): Promise<BroadcastResult> {
    if (this.isRunning) {
      throw new Error(
        "Рассылка уже запущена! Дождитесь завершения текущей рассылки."
      );
    }

    this.isRunning = true;

    try {
      // Валидируем и подготавливаем настройки сообщения
      this.validateMessageSettings(messageSettings);
      const result = await this.performBroadcast(
        users,
        messageSettings,
        options
      );
      return result;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Приватный метод для валидации настроек сообщения
   */
  private validateMessageSettings(settings: MessageSettings): void {
    console.log(settings);
    if (!settings.text || settings.text.trim() === "") {
      throw new Error("Текст сообщения не может быть пустым");
    }

    // Проверяем, что не используются одновременно фото и видео
    if (settings.photo && settings.video) {
      throw new Error(
        "Нельзя одновременно использовать фото и видео в одном сообщении"
      );
    }

    // Валидация кнопки - если есть текст кнопки, должна быть и ссылка
    if (settings.buttonText && !settings.buttonUrl) {
      throw new Error("Если указан текст кнопки, необходимо указать ссылку");
    }

    if (settings.buttonUrl && !settings.buttonText) {
      throw new Error("Если указана ссылка, необходимо указать текст кнопки");
    }

    // Валидация URL
    if (settings.buttonUrl && !this.isValidUrl(settings.buttonUrl)) {
      throw new Error("Некорректная ссылка для кнопки");
    }
  }

  /**
   * Проверяет валидность URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Создает клавиатуру с кнопкой, если нужно
   */
  private createKeyboard(settings: MessageSettings) {
    if (settings.buttonText && settings.buttonUrl) {
      return new InlineKeyboard().url(settings.buttonText, settings.buttonUrl);
    }
    return undefined;
  }

  /**
   * Метод для отправки сообщения конкретному пользователю
   * Этот метод будет переиспользоваться в разных частях приложения
   */
  async sendMessage(
    chatId: number,
    messageSettings: MessageSettings
  ): Promise<void> {
    const keyboard = this.createKeyboard(messageSettings);
    const messageOptions: any = {
      parse_mode: messageSettings.parse_mode,
      disable_web_page_preview: messageSettings.disable_web_page_preview,
      reply_markup: keyboard,
    };

    // Если есть фото, отправляем фото с подписью
    if (messageSettings.photo) {
      await this.bot.api.sendPhoto(chatId, messageSettings.photo, {
        caption: messageSettings.text,
        ...messageOptions,
      });
    }
    // Если есть видео, отправляем видео с подписью
    else if (messageSettings.video) {
      await this.bot.api.sendVideo(chatId, messageSettings.video, {
        caption: messageSettings.text,
        ...messageOptions,
      });
    }
    // Обычное текстовое сообщение
    else {
      await this.bot.api.sendMessage(
        chatId,
        messageSettings.text,
        messageOptions
      );
    }
  }

  /**
   * Перегруженный метод для отправки простого текстового сообщения
   * Для обратной совместимости
   */
  async sendSimpleMessage(chatId: string, text: string): Promise<void> {
    return this.sendMessage(Number(chatId), { text });
  }

  /**
   * Приватный метод для выполнения рассылки
   */
  private async performBroadcast(
    users: User[],
    messageSettings: MessageSettings,
    options: BroadcastOptions
  ): Promise<BroadcastResult> {
    const {
      delayMs = 100,
      skipInactive = true,
      retryOnRateLimit = true,
    } = options;

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      // Пропускаем неактивных пользователей, если указано
      if (skipInactive && !user.isActive) {
        continue;
      }

      // Пропускаем пользователей без chatId
      if (!user.chatId) {
        continue;
      }

      try {
        await this.sendMessage(Number(user.chatId), messageSettings);
        successCount++;

        // Задержка между сообщениями
        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        // Обработка ошибки 429 (Too Many Requests)
        if (this.isRateLimitError(error) && retryOnRateLimit) {
          const retryAfter = this.extractRetryAfter(error);

          // Ждем указанное количество секунд
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000)
          );

          // Повторяем попытку
          try {
            await this.sendMessage(Number(user.chatId), messageSettings);
            successCount++;
          } catch (secondError) {
            errorCount++;
            const errorMsg = `Повторная ошибка для ${user.username} (${user.chatId}): ${secondError}`;
            errors.push(errorMsg);
          }
        } else {
          // Обработка других ошибок
          errorCount++;
          const errorMsg = `Ошибка для ${user.username} (${user.chatId}): ${error}`;
          errors.push(errorMsg);
        }
      }

      // Периодически даем другим операциям возможность выполниться
      if (i % 10 === 0) {
        await new Promise((resolve) => setImmediate(resolve));
      }
    }

    return {
      successCount,
      errorCount,
      totalUsers: users.length,
      errors,
    };
  }

  /**
   * Проверяет, является ли ошибка превышением лимита запросов
   */
  private isRateLimitError(error: any): boolean {
    return (
      error instanceof Error && error.message.includes("429: Too Many Requests")
    );
  }

  /**
   * Извлекает время ожидания из ошибки rate limit
   */
  private extractRetryAfter(error: any): number {
    if (error instanceof Error) {
      const retryMatch = error.message.match(/retry after (\d+)/);
      return retryMatch ? parseInt(retryMatch[1]) : 10;
    }
    return 10; // по умолчанию 10 секунд
  }

  /**
   * Проверяет, заблокировал ли пользователь бота
   */
  private isUserBlockedError(error: any): boolean {
    return (
      error instanceof Error &&
      (error.message.includes("blocked") ||
        error.message.includes("user not found") ||
        error.message.includes("chat not found"))
    );
  }

  /**
   * Проверяет, запущена ли рассылка в данный момент
   */
  getBroadcastStatus(): boolean {
    return this.isRunning;
  }

  /**
   * Создает отчет о рассылке
   */
  createReport(result: BroadcastResult): string {
    const report =
      `📊 Рассылка завершена!\n\n` +
      `✅ Успешно отправлено: ${result.successCount}\n` +
      `❌ Ошибок: ${result.errorCount}\n` +
      `👥 Всего пользователей: ${result.totalUsers}`;

    return report;
  }

  /**
   * Создает детальный отчет об ошибках
   */
  createErrorReport(errors: string[], maxErrors: number = 10): string {
    if (errors.length === 0) {
      return "";
    }

    if (errors.length <= maxErrors) {
      return `Детали ошибок:\n${errors.join("\n")}`;
    } else {
      return `Слишком много ошибок (${errors.length}). Показаны первые ${maxErrors}:\n${errors.slice(0, maxErrors).join("\n")}`;
    }
  }
}
