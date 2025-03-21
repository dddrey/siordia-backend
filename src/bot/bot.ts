import dotenv from "dotenv";
dotenv.config();
import { Telegraf } from "telegraf";
import { BotService } from "./bot.service";

export class TelegramBot {
  private bot: Telegraf;
  public botService: BotService;

  constructor() {
    if (!process.env.BOT_TOKEN) {
      throw new Error("BOT_TOKEN is not defined in environment variables");
    }

    this.bot = new Telegraf(process.env.BOT_TOKEN);
    this.botService = new BotService(this.bot);
  }

  public async start() {
    try {
      await this.bot.launch();
      console.log("🤖 Telegram bot started successfully");
    } catch (error) {
      console.error("Failed to start Telegram bot:", error);
      throw error;
    }
  }

  public stop() {
    this.bot.stop();
  }

  public getBot() {
    return this.bot;
  }
}
