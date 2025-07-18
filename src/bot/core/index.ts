import { Bot } from "grammy";
import dotenv from "dotenv";
import { createOrUpdateSubscription } from "@/services/subscription.service";
import { startText, helpText, aboutText } from "../utils/text";
import { prisma } from "@/prisma/prismaClient";
import { BroadcastService } from "../broadcast/broadcast-service";

dotenv.config();

if (!process.env.BOT_TOKEN || !process.env.APP_URL) {
  throw new Error("BOT_TOKEN or APP_URL is not set");
}

const bot = new Bot(process.env.BOT_TOKEN!);

// Создаем instance BroadcastService
export const broadcastService = new BroadcastService(bot);

bot.command("start", async (ctx) => {
  await ctx.reply(startText, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "App", web_app: { url: process.env.APP_URL! } }],
      ],
    },
  });

  let user = await prisma.user.findUnique({
    where: { id: ctx.from?.id.toString() },
    include: {
      subscriptions: true,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: ctx.from?.id.toString(),
        username: ctx.from?.username || "",
        chatId: ctx.from?.id.toString(),
      },
      include: {
        subscriptions: true,
      },
    });
  }
  if (!user.chatId) {
    await prisma.user.update({
      where: { id: ctx.from?.id.toString() },
      data: { chatId: ctx.from?.id.toString() },
    });
  }
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

bot.on("message", async (ctx) => {
  console.log(ctx.message);

  // Проверяем, есть ли фото или видео в сообщении
  const photo = ctx.message?.photo;
  const video = ctx.message?.video;

  if (!photo && !video) {
    return; // Если нет фото или видео, игнорируем сообщение
  }

  // Проверяем, является ли пользователь админом
  const user = await prisma.user.findUnique({
    where: { id: ctx.from?.id.toString() },
  });

  if (!user || !user.isAdmin) {
    return;
  }

  try {
    let fileId: string;
    let fileType: string;

    if (photo) {
      // Для фото берём самое высокое качество (последний элемент массива)
      fileId = photo[photo.length - 1].file_id;
      fileType = "фото";
    } else {
      // Для видео берём file_id
      fileId = video!.file_id;
      fileType = "видео";
    }

    // Получаем информацию о файле для создания URL для скачивания
    const fileInfo = await ctx.api.getFile(fileId);
    const filePath = fileInfo.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${filePath}`;

    // Отправляем админу и file_id для рассылки, и URL для скачивания
    await ctx.reply(
      `✅ Файл обработан!\n\n` +
        `📁 Тип: ${fileType}\n` +
        `🆔 File ID для рассылки: \`${fileId}\`\n` +
        `🔗 Ссылка для скачивания: ${fileUrl}\n\n` +
        `💡 Для рассылки используйте File ID, а ссылку - для скачивания файла.`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Ошибка при обработке файла:", error);
    await ctx.reply("❌ Произошла ошибка при обработке файла.");
  }
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
