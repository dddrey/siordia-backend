import "./paths";
import "module-alias/register";
import app from "./app";
import dotenv from "dotenv";
import bot from "./bot";
dotenv.config();

const PORT = Number(process.env.PORT) || 4000;

process.once("SIGINT", () => {
  bot.stop();
});
process.once("SIGTERM", () => {
  bot.stop();
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
