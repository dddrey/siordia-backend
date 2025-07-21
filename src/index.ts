import "./paths";
import "module-alias/register";
import app from "./app";
import dotenv from "dotenv";
import bot from "./bot/core";
import { subscriptionNotificationService } from "./services/subscription-notification.service";
dotenv.config();

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", async () => {
  bot.start();

  subscriptionNotificationService.startScheduler();

  console.log(`Server is running on http://localhost:${PORT}`);
});
