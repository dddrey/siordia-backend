import { prisma } from "@/prisma/prismaClient";
import { broadcastService } from "@/bot/core";
import { ContentType } from "@prisma/client";
import { addDays, startOfDay, endOfDay, format } from "date-fns";
import { ru } from "date-fns/locale";

export class SubscriptionNotificationService {
  /**
   * Проверяет подписки, которые истекают завтра, и отправляет уведомления
   */
  async checkExpiringSubscriptions(): Promise<void> {
    console.log("🔔 Проверка истекающих подписок...");

    const tomorrow = addDays(new Date(), 1);
    const tomorrowStart = startOfDay(tomorrow);
    const tomorrowEnd = endOfDay(tomorrow);

    try {
      // Находим активные подписки, которые истекают завтра
      const expiringSubscriptions = await prisma.subscription.findMany({
        where: {
          active: true,
          endDate: {
            gte: tomorrowStart,
            lte: tomorrowEnd,
          },
        },
        include: {
          user: true,
        },
      });

      console.log(
        `📋 Найдено ${expiringSubscriptions.length} истекающих подписок`
      );

      if (expiringSubscriptions.length === 0) {
        console.log("✅ Нет подписок, которые истекают завтра");
        return;
      }

      // Отправляем уведомления каждому пользователю
      for (const subscription of expiringSubscriptions) {
        if (!subscription.user.chatId) {
          console.log(
            `⚠️ Пользователь ${subscription.user.username} не имеет chatId`
          );
          continue;
        }

        if (!subscription.user.isActive) {
          console.log(
            `⚠️ Пользователь ${subscription.user.username} неактивен`
          );
          continue;
        }

        try {
          await this.sendExpirationNotification(subscription);
          console.log(
            `✅ Уведомление отправлено пользователю ${subscription.user.username}`
          );
        } catch (error) {
          console.error(
            `❌ Ошибка отправки уведомления пользователю ${subscription.user.username}:`,
            error
          );
        }
      }

      console.log("🎉 Проверка истекающих подписок завершена");
    } catch (error) {
      console.error("❌ Ошибка при проверке истекающих подписок:", error);
    }
  }

  /**
   * Отправляет уведомление о скором истечении подписки
   */
  private async sendExpirationNotification(subscription: any): Promise<void> {
    const subscriptionTypeText = this.getSubscriptionTypeText(
      subscription.type
    );
    const expirationDate = format(subscription.endDate, "d MMMM yyyy", {
      locale: ru,
    });

    const message = `⏰ <b>Уведомление о подписке</b>

🔔 Ваша подписка "${subscriptionTypeText}" истекает завтра - ${expirationDate}!

💡 Чтобы продолжить пользоваться всеми функциями приложения, продлите подписку уже сегодня.

⚽️ Не прерывайте свой путь к совершенству!`;

    const messageSettings = {
      text: message,
      parse_mode: "HTML" as const,
      disable_web_page_preview: true,
      buttonText: "Продлить подписку",
      buttonUrl: process.env.MINI_APP_URL || "https://your-app-url.com",
    };

    await broadcastService.sendMessage(
      Number(subscription.user.chatId),
      messageSettings
    );
  }

  /**
   * Получает читаемое название типа подписки
   */
  private getSubscriptionTypeText(type: ContentType): string {
    switch (type) {
      case ContentType.player:
        return "Подписка для игрока";
      case ContentType.coach:
        return "Подписка для тренера";
      case ContentType.parent:
        return "Подписка для родителя";
      default:
        return "Подписка";
    }
  }

  /**
   * Запускает планировщик для ежедневной проверки подписок
   */
  startScheduler(): void {
    console.log("🚀 Запуск планировщика уведомлений о подписках");

    // Проверяем сразу при запуске (для тестирования)
    this.checkExpiringSubscriptions();

    // Запускаем проверку каждый день в 10:00 утра
    const checkTime = this.getNextCheckTime();
    console.log(`⏰ Следующая проверка запланирована на: ${checkTime}`);

    setTimeout(() => {
      this.checkExpiringSubscriptions();
      // После первой проверки запускаем интервал каждые 24 часа
      setInterval(
        () => {
          this.checkExpiringSubscriptions();
        },
        24 * 60 * 60 * 1000
      ); // 24 часа
    }, this.getMillisecondsUntilNextCheck());
  }

  /**
   * Вычисляет время следующей проверки (10:00 утра)
   */
  private getNextCheckTime(): string {
    const now = new Date();
    const nextCheck = new Date();
    nextCheck.setHours(10, 0, 0, 0);

    // Если уже после 10:00, планируем на завтра
    if (now.getHours() >= 10) {
      nextCheck.setDate(nextCheck.getDate() + 1);
    }

    return format(nextCheck, "d MMMM yyyy, HH:mm", { locale: ru });
  }

  /**
   * Вычисляет миллисекунды до следующей проверки
   */
  private getMillisecondsUntilNextCheck(): number {
    const now = new Date();
    const nextCheck = new Date();
    nextCheck.setHours(10, 0, 0, 0);

    // Если уже после 10:00, планируем на завтра
    if (now.getHours() >= 10) {
      nextCheck.setDate(nextCheck.getDate() + 1);
    }

    return nextCheck.getTime() - now.getTime();
  }
}

// Экспортируем единственный экземпляр сервиса
export const subscriptionNotificationService =
  new SubscriptionNotificationService();
