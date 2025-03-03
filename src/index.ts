import "module-alias/register";
import app from "./app";
import dotenv from "dotenv";
import cors from "cors";
import { corsOptions } from "./config/cors.config";
dotenv.config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
