import prisma from "../prisma/prismaClient";

interface UserData {
  id: string;
  username: string;
  avatarUrl?: string;
}

export const findOrCreateUser = async (userData: UserData) => {
  let user = await prisma.user.findUnique({
    where: { id: userData.id },
    include: {
      subscriptions: true,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userData.id,
        username: userData.username,
        avatarUrl: userData.avatarUrl || null,
      },
      include: {
        subscriptions: true,
      },
    });
  }

  console.log(user)

  return user;
};