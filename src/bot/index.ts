import { Bot } from "grammy";
import dotenv from "dotenv";
import { createOrUpdateSubscription } from "@/services/subscription.service";

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
      await createOrUpdateSubscription(
        ctx.from?.id.toString(),
        parsedData.type
      );
    } catch (error) {
      console.error("Error creating subscription:", error);
      ctx.reply("Произошла ошибка при создании подписки");
    }
  }
  ctx.refundStarPayment();
});

export default bot;
