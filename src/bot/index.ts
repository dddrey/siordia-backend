import { Bot } from "grammy";
import dotenv from "dotenv";

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN!);

bot.on("pre_checkout_query", async (ctx) => {
  console.log("Pre checkout query:", ctx.message);
  await ctx.answerPreCheckoutQuery(true);
});

bot.on(":successful_payment", async (ctx) => {
  console.log("Payment successful:", ctx.message?.successful_payment);
});

bot.on("message", async (ctx) => {
  console.log("Message:", ctx.message);
  await ctx.reply("Payment successful!");
});

export default bot;
