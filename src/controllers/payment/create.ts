import BotService from "@/bot/bot";
import { asyncHandler } from "@/middleware/asyncHandler";
import { ValidationError } from "@/utils/errors/AppError";
import { ContentType } from "@prisma/client";
import { Request, Response } from "express";

export const createPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, description, type } = req.body;

    if (!title || !description || !type) {
      throw new ValidationError("All fields are required");
    }

    if (!Object.values(ContentType).includes(type as ContentType)) {
      throw new ValidationError("Invalid type");
    }

    const payment = await BotService.getInstance().createInvoiceLink({
      title,
      description,
      type,
    });

    res.json({
      success: true,
      data: payment,
    });
  }
);
