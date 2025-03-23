import { Bot } from "grammy";
import dotenv from "dotenv";
import { createSubscription } from "./create.sub";
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
    try {
      await createSubscription(parsedData.type, ctx.from?.id.toString());
    } catch (error) {
      console.error("Error creating subscription:", error);
      ctx.reply("Произошла ошибка при создании подписки");
    }
  }
  ctx.refundStarPayment();
});

export default bot;
