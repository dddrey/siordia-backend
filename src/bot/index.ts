import { Bot } from "grammy";
import dotenv from "dotenv";
import { prisma } from "@/prisma/prismaClient";

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN!);

bot.on("pre_checkout_query", async (ctx) => {
  console.log("Pre checkout query:", ctx.message);
  await ctx.answerPreCheckoutQuery(true);
});

bot.on(":successful_payment", async (ctx) => {
  ctx.reply("Вы получили Pro версию");
  console.log("successful_payment: ", ctx.update);
  ctx.reply(JSON.stringify(ctx.update.message?.invoice));
  ctx.reply(JSON.stringify(ctx.update.message?.invoice?.start_parameter));
  ctx.reply(JSON.stringify(ctx.update.message?.invoice?.currency));
  ctx.reply(JSON.stringify(ctx.update.message?.invoice?.total_amount));
  ctx.refundStarPayment();
});

export default bot;
