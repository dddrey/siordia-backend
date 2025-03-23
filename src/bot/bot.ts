import dotenv from "dotenv";
dotenv.config();
import { Bot, Context } from "grammy";
import { PaymentService } from "./bot.payment";
import { ContentType } from "@prisma/client";

export class BotService {
  private static instance: BotService;
  private bot: Bot<Context>;
  private paymentService: PaymentService;

  private constructor() {
    if (!process.env.BOT_TOKEN) {
      throw new Error("BOT_TOKEN is not defined");
    }
    this.bot = new Bot(process.env.BOT_TOKEN);
    this.paymentService = new PaymentService(this.bot);
    this.initHandlers();
  }

  private initHandlers() {
    this.bot.on("pre_checkout_query", async (ctx) => {
      await ctx.answerPreCheckoutQuery(true);
    });

    this.bot.on(":successful_payment", async (ctx) => {
      // Обработка успешного платежа
      console.log("Payment successful:", ctx.message?.successful_payment);
    });
  }

  public static getInstance(): BotService {
    if (!BotService.instance) {
      BotService.instance = new BotService();
    }
    return BotService.instance;
  }

  public start() {
    this.bot.start();
  }

  public stop() {
    this.bot.stop();
  }

  public getBot() {
    return this.bot;
  }

  public async createInvoiceLink({
    title,
    description,
    type,
  }: {
    title: string;
    description: string;
    type: ContentType;
  }) {
    return this.paymentService.createPaymentLink({
      title,
      description,
      type,
    });
  }
}

export default BotService;
