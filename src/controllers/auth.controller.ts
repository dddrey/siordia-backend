import { Request, Response } from "express";
import { findOrCreateUser } from "../services/auth.service";

export const authenticateUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { initData } = req;

    if (!initData) {
      throw new Error("User data not available");
    }

    const user = await findOrCreateUser({
      id: initData.id,
      username: initData.username,
      avatarUrl: initData.photo_url,
    });

    return res.json(user);
  } catch (error) {
    console.error("Error during authentication:", error);
    throw new Error("Internal server error.");
  }
};
