import "module-alias/register";
import app from "./app";
import dotenv from "dotenv";
import cors from "cors";
import { corsOptions, additionalHeaders } from "./config/cors.config";
dotenv.config();

app.use(cors(corsOptions));
app.use(additionalHeaders);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
