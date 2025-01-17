import express from "express";
import { parseInitDataMiddleware } from "./middleware/parseInitData";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middleware/errorHandler";
import folderRoutes from "./routes/folder.routes";
import { authMiddleware } from "./middleware/authMiddleware";
import lessonRoutes from "./routes/lesson.routes";
import topicRoutes from "./routes/topic.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import "express-async-errors"; 

const app = express();

app.use(express.json()); // JSON-парсер
app.use(parseInitDataMiddleware); // Middleware
app.use("/", authRoutes); // Роуты, которые не требуют аутентификации (например, регистрация и логин)

// Добавляем аутентификацию после того, как прошли роуты, которые не требуют авторизации
app.use(authMiddleware); // Теперь middleware авторизации применяется ко всем маршрутам, которые идут после него.

app.use("/folders", folderRoutes); // Роуты, которые требуют аутентификации
app.use("/topics", topicRoutes); // Роуты, которые требуют аутентификации
app.use("/lessons", lessonRoutes); // Роуты, которые требуют аутентификации
app.use("/subscriptions", subscriptionRoutes); // Роуты, которые требуют аутентификации

app.use(errorHandler);

export default app;