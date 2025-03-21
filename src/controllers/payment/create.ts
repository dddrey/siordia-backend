import { bot } from "@/app";
import { asyncHandler } from "@/middleware/asyncHandler";
import { Request, Response } from "express";

export const createPayment = asyncHandler(
  async (req: Request, res: Response) => {
    // const { amount, userId, description } = req.body;

    // if (!amount || !userId || !description) {
    //   return res.status(400).json({
    //     success: false,
    //     error: "Missing required fields",
    //   });
    // }

    const payment = await bot.botService.createPaymentLink({
      amount: 100,
      userId: 1,
      description: "Тестовый платеж",
    });

    res.json({
      success: true,
      data: payment,
    });
  }
);
