import { Bot } from "grammy";
import dotenv from "dotenv";

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN!);

bot.on("pre_checkout_query", async (ctx) => {
  console.log("Pre checkout query:", ctx.message);
  await ctx.answerPreCheckoutQuery(true);
});

bot.on(":successful_payment", async (ctx) => {
  ctx.reply("Вы получили Pro версию");
  console.log("successful_payment: ", ctx.update.message?.successful_payment);
  ctx.reply(JSON.stringify(ctx.update.message?.successful_payment));
  ctx.refundStarPayment();
});

export default bot;
