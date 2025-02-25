import { ContentType } from "@prisma/client";
import { asyncHandler } from "@/middleware/asyncHandler";
import { ValidationError } from "@/utils/errors/AppError";
import { prisma } from "@/prisma/prismaClient";
import { Request, Response } from "express";

export const createSubscription = asyncHandler(
  async (req: Request, res: Response) => {
    const { type }: { type: ContentType } = req.body;

    if (!req.user) {
      throw new ValidationError("User not found");
    }

    const { id: userId, subscriptions } = req.user;

    if (!type || !Object.values(ContentType).includes(type as ContentType)) {
      throw new ValidationError("Invalid type");
    }

    const existingSubscription = subscriptions.find((sub) => sub.type === type);

    if (existingSubscription) {
      const updatedSubscription = await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: existingSubscription.active
          ? {
              endDate: new Date(
                existingSubscription.endDate.getTime() +
                  30 * 24 * 60 * 60 * 1000
              ),
            }
          : {
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              active: true,
            },
      });

      return res.status(200).json(updatedSubscription);
    }

    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        type,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(201).json(newSubscription);
  }
);
