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

    if (!Object.values(ContentType).includes(type as ContentType)) {
      throw new Error("Invalid type");
    }

    console.log(
      `Attempting to handle subscription for user ${userId}, type: ${type}`
    );

    // Ищем существующую подписку
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        type,
      },
    });

    console.log("Existing subscription:", existingSubscription);

    if (existingSubscription) {
      // Всегда создаем новую подписку вместо обновления существующей
      const now = new Date();
      const newEndDate = addMonths(now, 1);

      // Деактивируем старую подписку
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: { active: false },
      });

      // Создаем новую подписку
      const newSubscription = await prisma.subscription.create({
        data: {
          userId,
          type,
          startDate: now,
          endDate: newEndDate,
          active: true,
        },
      });

      console.log("Created new subscription:", newSubscription);
      return newSubscription;
    }

    // Если подписки нет, создаем новую
    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        type,
        endDate: addMonths(new Date(), 1),
        active: true,
      },
    });

    console.log("Created new subscription:", newSubscription);
    return newSubscription;
  } catch (error) {
    console.error("Error in createOrUpdateSubscription:", error);
    throw error;
  }
};
