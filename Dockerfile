FROM node:18

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
RUN npm ci

# Копируем исходный код
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем TypeScript
RUN npm run build

EXPOSE 4000

# Используем команду для запуска собранного приложения
CMD ["npm", "start"]
