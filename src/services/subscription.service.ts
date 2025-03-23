import { PrismaClient, ContentType } from "@prisma/client";

const prisma = new PrismaClient();

export const createOrUpdateSubscription = async (
  userId?: string,
  type?: ContentType
) => {
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

    const existingSubscription = await prisma.subscription.deleteMany({
      where: {
        userId,
      },
    });

    console.log("Existing subscription deleted:", existingSubscription);
  } catch (error) {
    console.error("Error in createOrUpdateSubscription:", error);
    throw error;
  }
};
