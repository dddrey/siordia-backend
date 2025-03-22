import { Bot, Context } from "grammy";
import dotenv from "dotenv";
import { ContentType } from "@prisma/client";
dotenv.config();

class BotService {
  private static instance: BotService;
  private bot: Bot<Context>;

  private constructor(token: string) {
    this.bot = new Bot(token);
    this.registerHandlers();
  }

  public static getInstance() {
    if (!BotService.instance) {
      BotService.instance = new BotService(process.env.BOT_TOKEN!);
    }
    return BotService.instance;
  }

  private registerHandlers() {
    this.bot.command("start", (ctx) => {
      ctx.reply("Welcome !");
    });

    this.bot.on("pre_checkout_query", async (ctx) => {
      const query = ctx.update.pre_checkout_query;
      console.log("pre_checkout_query: ", query);

      const payload = JSON.parse(query.invoice_payload);

      console.log("payload: ", payload);

      await ctx.answerPreCheckoutQuery(true);
    });

    this.bot.on(":successful_payment", async (ctx) => {
      // ctx.editUserStarSubscription(ctx.update.message?.successful_payment.is_recurring)
      ctx.refundStarPayment();
    });
  }

  public start() {
    this.bot.start();
  }

  public async createInvoiceLink({
    title,
    description,
    type,
  }: {
    title: string;
    description: string;
    type: ContentType;
  }) {
    const invoice = {
      title,
      description,
      payload: JSON.stringify({
        subscription_period: "yearly",
      }),
      provider_token: "",
      currency: "XTR",
      prices: [
        {
          label: "Upgrade to Pro",
          amount: 1,
        },
      ],
      type,
    };

    try {
      const invoiceLink = await this.bot.api.createInvoiceLink(
        invoice.title,
        invoice.description,
        invoice.payload,
        invoice.provider_token,
        invoice.currency,
        invoice.prices
      );

      return invoiceLink;
    } catch (err) {
      throw new Error(`error on createInvoiceLink: ${err}`);
    }
  }
}

export default BotService;
