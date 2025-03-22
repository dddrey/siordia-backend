import { Bot, Context } from "grammy";
import dotenv from "dotenv";
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

      const { subscription_period } = payload;
      console.log("subscription_period: ", subscription_period);

      if (subscription_period) {
        switch (subscription_period) {
          case "yearly":
            // Database actions
            // userModel.activateSubscription(userid, subscription_period, DB)
            await ctx.answerPreCheckoutQuery(true);
            break;
          case "monthly":
            // Database actions
            // userModel.activateSubscription(userid, subscription_period, DB)
            await ctx.answerPreCheckoutQuery(true);
            break;
        }
      }
      await ctx.answerPreCheckoutQuery(
        false,
        "Выбран несуществующий период подписки"
      );
    });

    this.bot.on(":successful_payment", async (ctx) => {
      ctx.reply("Вы получили Pro версию");
      console.log(
        "successful_payment: ",
        ctx.update.message?.successful_payment
      );
      console.log(
        "is reccuring: ",
        ctx.update.message?.successful_payment.is_recurring
      );
      // ctx.editUserStarSubscription(ctx.update.message?.successful_payment.is_recurring)
      ctx.refundStarPayment();
    });
  }

  public start() {
    this.bot.start();
  }

  public async createInvoiceLink() {
    const invoice = {
      title: "Some Title",
      description: "Some Description",
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
      subscription_period: 2592000,
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
