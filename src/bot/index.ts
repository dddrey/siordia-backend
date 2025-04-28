import { Bot } from "grammy";
import dotenv from "dotenv";
import { createOrUpdateSubscription } from "@/services/subscription.service";
import { startText, helpText, aboutText } from "./text";
dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN!);

bot.command("start", async (ctx) => {
  await ctx.reply(startText, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "App", web_app: { url: process.env.APP_URL! } }],
      ],
    },
  });
});

bot.command("help", async (ctx) => {
  await ctx.reply(helpText);
});

bot.command("about", async (ctx) => {
  await ctx.reply(aboutText, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "App", web_app: { url: process.env.APP_URL! } }],
      ],
    },
  });
});

bot.on("pre_checkout_query", async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

bot.on(":successful_payment", async (ctx) => {
  ctx.reply("Вы получили Pro версию");
  if (ctx.update.message?.successful_payment) {
    const parsedData = JSON.parse(
      ctx.update.message?.successful_payment.invoice_payload
    );
    try {
      await createOrUpdateSubscription(
        ctx.from?.id.toString(),
        parsedData.type
      );
    } catch (error) {
      console.error("Error creating subscription:", error);
      ctx.reply("Произошла ошибка при создании подписки");
    }
  }
});

export default bot;
