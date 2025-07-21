import express from "express";
import { parseInitDataMiddleware } from "./middleware/parseInitData";
import { errorHandler } from "./middleware/errorHandler";
import folderRoutes from "./routes/folder.routes";
import { authMiddleware } from "./middleware/authMiddleware";
import lessonRoutes from "./routes/lesson.routes";
import topicRoutes from "./routes/topic.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import "express-async-errors";
import { checkExpiredSubscriptions } from "./middleware/checkExpiredSubscriptions";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config";
import statisticsRoutes from "./routes/statistics.routes";
import { authenticateUser } from "./controllers/auth/authenticate";
import fileRoutes from "./controllers/auth/fileRoutes";
import userRoutes from "./routes/user.routes";
import broadcastRoutes from "./routes/broadcast.routes";

const app = express();
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(parseInitDataMiddleware);

app.use("/auth", authenticateUser);

app.use(authMiddleware);
app.use(checkExpiredSubscriptions);

app.use("/", fileRoutes);
app.use("/folders", folderRoutes);
app.use("/topics", topicRoutes);
app.use("/lessons", lessonRoutes);
app.use("/broadcast", broadcastRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/statistics", statisticsRoutes);
app.use("/user", userRoutes);

app.use(errorHandler);

export default app;
