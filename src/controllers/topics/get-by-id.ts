import { asyncHandler } from "@/middleware/asyncHandler";
import { prisma } from "@/prisma/prismaClient";
import { NotFoundError } from "@/utils/errors/AppError";
import { hasActiveSubscription } from "@/utils/subscription";
import { Request, Response } from "express";

export const getTopicById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        folder: true,
        lessons: {
          select: {
            id: true,
            name: true,
            about: true,
            description: true,
            orderNumber: true,
            views: true,
            isSubscriptionRequired: true,
            createdAt: true,
            updatedAt: true,
            type: true,
          },
          orderBy: {
            orderNumber: "asc",
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundError("Topic not found");
    }

    const isHavePermission = hasActiveSubscription(req, topic.type);

    res.json({
      topic: topic,
      isHavePermission: isHavePermission,
    });
  }
);
