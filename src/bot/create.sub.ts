import { prisma } from "@/prisma/prismaClient";
import { ContentType } from "@prisma/client";

export const createSubscription = async (
  type: ContentType,
  userId?: string
) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!type) {
    throw new Error("Type is required");
  }
  if (!Object.values(ContentType).includes(type as ContentType)) {
    throw new Error("Invalid type");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      subscriptions: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const existingSubscription = user.subscriptions.find(
    (sub) => sub.type === type
  );

  if (existingSubscription) {
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: existingSubscription.active
        ? {
            endDate: new Date(
              existingSubscription.endDate.getTime() + 30 * 24 * 60 * 60 * 1000
            ),
            active: true,
          }
        : {
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            active: true,
          },
    });
  }

  await prisma.subscription.create({
    data: {
      userId,
      type,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
};
