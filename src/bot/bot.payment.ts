import { Bot, Context } from "grammy";
import { ContentType } from "@prisma/client";

export class PaymentService {
  private bot: Bot<Context>;

  constructor(bot: Bot<Context>) {
    this.bot = bot;
  }

  async createPaymentLink({
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
        type,
        timestamp: Date.now(),
      }),
      provider_token: "",
      currency: "XTR",
      prices: [
        {
          label: title,
          amount: 1,
        },
      ],
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
      throw new Error(`Error creating invoice link: ${err}`);
    }
  }
}
