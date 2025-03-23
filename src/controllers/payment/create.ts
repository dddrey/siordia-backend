import { asyncHandler } from "@/middleware/asyncHandler";
import { ValidationError } from "@/utils/errors/AppError";
import { ContentType } from "@prisma/client";
import { Request, Response } from "express";
import bot from "@/bot";
export const createPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { type } = req.body;

    const invoice = {
      title: "Upgrade to Pro",
      description: "Upgrade to Pro",
      payload: JSON.stringify({
        type,
        timestamp: Date.now(),
      }),
      provider_token: "",
      currency: "XTR",
      prices: [
        {
          label: "Upgrade to Pro",
          amount: 1,
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
