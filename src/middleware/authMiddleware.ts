import { Request, Response, NextFunction } from "express";
import { prisma } from "@/prisma/prismaClient";
import { UnauthorizedError } from "@/utils/errors/AppError";
import { Subscription, User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User & { subscriptions: Subscription[] };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { initData } = req;

    if (!initData) throw new UnauthorizedError("No init data provided");

    const user = await prisma.user.findUnique({
      where: {
        id: initData?.id.toString(),
      },
      include: {
        subscriptions: true,
      },
    });

    if (!user) throw new UnauthorizedError("User not found");

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
