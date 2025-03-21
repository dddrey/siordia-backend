import "./paths";
import "module-alias/register";
import app from "./app";
import dotenv from "dotenv";
dotenv.config();

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
