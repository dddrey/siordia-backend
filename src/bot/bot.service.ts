import { Telegraf } from "telegraf";
import {
  IPaymentCreate,
  IPaymentResponse,
} from "@/interfaces/payment.interface";

export class BotService {
  private bot: Telegraf;

  constructor(bot: Telegraf) {
    this.bot = bot;
  }

  async createPaymentLink(payment: IPaymentCreate): Promise<IPaymentResponse> {
    try {
      const invoice = {
        chat_id: payment.userId,
        title: "Оплата подписки",
        description: payment.description,
        payload: JSON.stringify({
          userId: payment.userId,
          paymentId: `pay_${Date.now()}_${payment.userId}`,
        }),
        provider_token: "",
        currency: "XTR", // Используем STARS как валюту
        prices: [
          {
            label: "Подписка",
            amount: 1, // Количество звезд (не умножаем на 100)
          },
        ],
        start_parameter: "subscription_payment",
      };

      const result = await this.bot.telegram.createInvoiceLink(invoice);

      return {
        paymentUrl: result,
        paymentId: JSON.parse(invoice.payload).paymentId,
      };
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  }

  async sendMessage(chatId: number, message: string) {
    try {
      await this.bot.telegram.sendMessage(chatId, message);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }
}
