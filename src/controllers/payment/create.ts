import { asyncHandler } from "@/middleware/asyncHandler";
import { ValidationError } from "@/utils/errors/AppError";
import { ContentType } from "@prisma/client";
import { Request, Response } from "express";
import bot from "@/bot";
export const createPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { type } = req.body;

    let title;

    switch (type) {
      case ContentType.player:
        title = "подписку для игрока на 1 месяц";
        break;
      case ContentType.coach:
        title = "подписку для тренера на 1 месяц";
        break;
      case ContentType.parent:
        title = "подписку для родителя на 1 месяц";
        break;
      default:
        title = "подписку на 1 месяц";
    }

    const invoice = {
      title,
      description: "Оплатить подписку на 1 месяц",
      payload: JSON.stringify({
        type,
        timestamp: Date.now(),
      }),
      provider_token: "",
      currency: "XTR",
      prices: [
        {
          label: "цена за 1 месяц",
          amount: 1200,
        },
      ],
    };

    if (!type) {
      throw new ValidationError("Type is required");
    }

    if (!Object.values(ContentType).includes(type as ContentType)) {
      throw new ValidationError("Invalid type");
    }

    const invoiceLink = await bot.api.createInvoiceLink(
      invoice.title,
      invoice.description,
      invoice.payload,
      invoice.provider_token,
      invoice.currency,
      invoice.prices
    );

    res.json({
      success: true,
      data: invoiceLink,
    });
  }
);
