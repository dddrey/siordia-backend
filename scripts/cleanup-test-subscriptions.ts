import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Скрипт для очистки тестовых подписок
 * Удаляет все активные подписки и тестовых пользователей
 */
async function cleanupTestData() {
  try {
    console.log("🧹 Начинаем очистку тестовых данных...");

    // Удаляем все активные подписки
    const deletedSubscriptions = await prisma.subscription.deleteMany({
      where: {
        active: true,
      },
    });

    console.log(`✅ Удалено подписок: ${deletedSubscriptions.count}`);

    // Удаляем тестовых пользователей (начинающихся с test_user_)
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        username: {
          startsWith: "test_user_",
        },
      },
    });

    console.log(`✅ Удалено тестовых пользователей: ${deletedUsers.count}`);

    console.log("\n🎉 Очистка тестовых данных завершена!");
  } catch (error) {
    console.error("❌ Ошибка при очистке:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт, если файл выполняется напрямую
if (require.main === module) {
  cleanupTestData();
}

export { cleanupTestData };
