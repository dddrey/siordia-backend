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

    console.log(
      `Attempting to handle subscription for user ${userId}, type: ${type}`
    );

    // Ищем существующую подписку
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        type,
        active: true,
      },
    });

    console.log("Existing subscription:", existingSubscription);

    if (existingSubscription) {
      console.log("Current endDate:", existingSubscription.endDate);
      // Проверяем, не истекла ли подписка
      const now = new Date();
      const currentEndDate = new Date(existingSubscription.endDate);

      // Если подписка истекла, начинаем с текущей даты
      const baseDate = currentEndDate < now ? now : currentEndDate;
      const newEndDate = addMonths(baseDate, 1);

      console.log("New endDate will be:", newEndDate);

      const updatedSubscription = await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          endDate: newEndDate,
          active: true,
        },
      });

      console.log("Updated subscription:", updatedSubscription);
      return updatedSubscription;
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
