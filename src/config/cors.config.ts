import { CorsOptions } from "cors";
import dotenv from "dotenv";
dotenv.config();

export const corsOptions: CorsOptions = {
  origin: [
    "http://localhost:5172",
    "http://localhost:5173",
    process.env.FRONTEND_URL || "",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "init-data",
  ],
  maxAge: 86400,
};
