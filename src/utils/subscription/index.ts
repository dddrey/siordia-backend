import { Request } from "express";
import { ContentType } from "@prisma/client";
import { ValidationError } from "../errors/AppError";

export const hasActiveSubscription = (
  req: Request,
  type: ContentType
): boolean => {
  if (!req.user) {
    throw new ValidationError("User not found");
  }

  if (req.user.isAdmin) return true;

  const { subscriptions } = req.user;

  const subscription = subscriptions.find(
    (sub) =>
      sub.type === type && sub.active && new Date(sub.endDate) > new Date()
  );

  return !!subscription;
};
