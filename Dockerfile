FROM node:18

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
RUN npm install

# Копируем исходный код
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем TypeScript
RUN npm run build

# Убедимся, что все модули установлены для production
RUN npm ci --only=production

EXPOSE 4000

# Используем команду для запуска собранного приложения
CMD ["npm", "start"]
