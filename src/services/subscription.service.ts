import { PrismaClient, ContentType, Subscription } from "@prisma/client";
import { addMinutes } from "date-fns";

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

    // Сначала ищем активную подписку
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        type,
        active: true,
      },
    });

    if (activeSubscription) {
      const newEndDate = addMinutes(new Date(activeSubscription.endDate), 1);

      const updatedSubscription = await prisma.subscription.update({
        where: { id: activeSubscription.id },
        data: {
          endDate: newEndDate,
          active: true,
        },
      });

      return updatedSubscription;
    }

    // Если активной нет, ищем последнюю неактивную
    const inactiveSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        type,
        active: false,
      },
      orderBy: {
        endDate: "desc",
      },
    });

    const now = new Date();

    if (inactiveSubscription) {
      const updatedSubscription = await prisma.subscription.update({
        where: { id: inactiveSubscription.id },
        data: {
          startDate: now,
          endDate: addMinutes(now, 1),
          active: true,
        },
      });

      return updatedSubscription;
    }

    // Если вообще нет подписок, создаем новую
    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        type,
        endDate: addMinutes(now, 1),
        active: true,
      },
    });

    return newSubscription;
  } catch (error) {
    console.error("Error in createOrUpdateSubscription:", error);
    throw error;
  }
};
