import { Bot } from "grammy";
import dotenv from "dotenv";

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN!);

bot.on("pre_checkout_query", async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

bot.on(":successful_payment", async (ctx) => {
  console.log("Payment successful:", ctx.message?.successful_payment);
  ctx.refundStarPayment();
});

export default bot;
