import { PrismaClient, ContentType, Subscription } from "@prisma/client";
import { addMonths, isAfter } from "date-fns";

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
      },
    });

    console.log("Existing subscription:", existingSubscription);

    const now = new Date();

    if (existingSubscription) {
      const currentEndDate = new Date(existingSubscription.endDate);
      console.log("Current endDate:", currentEndDate);
      console.log("Current date:", now);

      let newEndDate: Date;

      // Если текущая дата больше даты окончания подписки
      if (isAfter(now, currentEndDate)) {
        console.log("Subscription expired, starting from current date");
        newEndDate = addMonths(now, 1);
      } else {
        console.log("Subscription active, extending from current end date");
        newEndDate = addMonths(currentEndDate, 1);
      }

      console.log("New endDate will be:", newEndDate);

      const updatedSubscription = await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          endDate: newEndDate,
          active: true,
          // Обновляем startDate только если подписка истекла
          ...(isAfter(now, currentEndDate) && { startDate: now }),
        },
      });

      console.log("Updated subscription:", updatedSubscription);
      return updatedSubscription;
    }

    // Создаем новую подписку
    console.log("Creating new subscription from:", now);
    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        type,
        startDate: now,
        endDate: addMonths(now, 1),
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
