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
  if (ctx.update.message?.successful_payment) {
    const parsedData = JSON.parse(
      ctx.update.message?.successful_payment.invoice_payload
    );
    ctx.reply(parsedData.type);
  }
  ctx.refundStarPayment();
});

export default bot;
