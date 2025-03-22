import BotService from "@/bot/bot";
import { asyncHandler } from "@/middleware/asyncHandler";
import { Request, Response } from "express";

export const createPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const payment = await BotService.getInstance().createInvoiceLink();

    res.json({
      success: true,
      data: payment,
    });
  }
);
