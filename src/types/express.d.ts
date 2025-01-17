import "express";

declare global {
  namespace Express {
    interface Request {
      initData?: {
        id: string;
        username: string;
        photo_url?: string;
      };
    }
  }
}