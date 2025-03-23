import { PrismaClient, ContentType, Subscription } from "@prisma/client";
import { addMonths } from "date-fns";

const prisma = new PrismaClient();

export const createOrUpdateSubscription = async (
  userId?: string,
  type?: ContentType
): Promise<Subscription> => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!type) {
      throw new Error("Type is required");
    }

    // Ищем активную подписку
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        type,
        active: true,
      },
    });

    if (existingSubscription) {
      // Если есть активная подписка, добавляем месяц к её дате окончания
      const newEndDate = addMonths(new Date(existingSubscription.endDate), 1);

      const updatedSubscription = await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          endDate: newEndDate,
          active: true,
        },
      });

      return updatedSubscription;
    }

    // Если активной подписки нет, создаем новую
    const now = new Date();
    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        type,
        endDate: addMonths(now, 1),
        active: true,
      },
    });

    return newSubscription;
  } catch (error) {
    console.error("Error in createOrUpdateSubscription:", error);
    throw error;
  }
};
