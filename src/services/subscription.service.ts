import { PrismaClient, ContentType, Subscription } from "@prisma/client";
import { addMonths } from "date-fns";

const prisma = new PrismaClient();

export const createOrUpdateSubscription = async (
  userId?: string,
  type?: ContentType
): Promise<Subscription> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!type) {
    throw new Error("Type is required");
  }

  if (!Object.values(ContentType).includes(type as ContentType)) {
    throw new Error("Invalid type");
  }

  try {
    // Ищем существующую подписку
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        type,
      },
    });

    if (existingSubscription) {
      // Если подписка существует, продлеваем её
      const newEndDate = existingSubscription.active
        ? addMonths(existingSubscription.endDate, 1) // Добавляем месяц к текущей дате окончания
        : addMonths(new Date(), 1); // Если неактивна, начинаем с текущей даты

      return await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          endDate: newEndDate,
          active: true,
        },
      });
    }

    // Если подписки нет, создаем новую
    return await prisma.subscription.create({
      data: {
        userId,
        type,
        endDate: addMonths(new Date(), 1),
        active: true,
      },
    });
  } catch (error) {
    console.error("Error in createOrUpdateSubscription:", error);
    throw error;
  }
};
