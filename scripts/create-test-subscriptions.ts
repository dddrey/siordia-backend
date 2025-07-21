import { PrismaClient, ContentType } from "@prisma/client";
import { addDays, endOfDay, startOfDay } from "date-fns";

const prisma = new PrismaClient();

/**
 * Скрипт для создания тестовых подписок с разными датами истечения
 * Создает подписки для всех пользователей:
 * - player: истекают сегодня
 * - coach: истекают завтра (для тестирования уведомлений)
 * - parent: истекают послезавтра
 */
async function createTestSubscriptions() {
  try {
    console.log("🚀 Начинаем создание тестовых подписок...");

    // Получаем всех пользователей
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        isActive: true,
      },
    });

    console.log(`📋 Найдено пользователей: ${users.length}`);

    if (users.length === 0) {
      console.log(
        "⚠️  Пользователи не найдены. Создаем тестового пользователя..."
      );

      const testUser = await prisma.user.create({
        data: {
          username: `test_user_${Date.now()}`,
          chatId: `test_chat_${Date.now()}`,
          isActive: true,
        },
      });

      users.push({
        id: testUser.id,
        username: testUser.username,
        isActive: testUser.isActive,
      });

      console.log(`✅ Создан тестовый пользователь: ${testUser.username}`);
    }

    // Определяем даты
    const today = endOfDay(new Date());
    const tomorrow = endOfDay(addDays(new Date(), 1));
    const dayAfterTomorrow = endOfDay(addDays(new Date(), 2));
    const startDate = startOfDay(new Date());

    console.log("📅 Даты для подписок:");
    console.log(`   Сегодня (player): ${today.toLocaleString()}`);
    console.log(`   Завтра (coach): ${tomorrow.toLocaleString()}`);
    console.log(
      `   Послезавтра (parent): ${dayAfterTomorrow.toLocaleString()}`
    );

    let createdCount = 0;
    let updatedCount = 0;

    // Создаем подписки для каждого пользователя
    for (const user of users) {
      console.log(
        `\n👤 Обрабатываем пользователя: ${user.username} (${user.id})`
      );

      // Создаем подписки всех трех типов
      const subscriptionTypes: Array<{
        type: ContentType;
        endDate: Date;
        description: string;
      }> = [
        {
          type: ContentType.player,
          endDate: today,
          description: "истекает сегодня",
        },
        {
          type: ContentType.coach,
          endDate: tomorrow,
          description: "истекает завтра",
        },
        {
          type: ContentType.parent,
          endDate: dayAfterTomorrow,
          description: "истекает послезавтра",
        },
      ];

      for (const { type, endDate, description } of subscriptionTypes) {
        try {
          // Проверяем, есть ли уже активная подписка этого типа
          const existingSubscription = await prisma.subscription.findFirst({
            where: {
              userId: user.id,
              type,
              active: true,
            },
          });

          if (existingSubscription) {
            // Обновляем существующую подписку
            await prisma.subscription.update({
              where: { id: existingSubscription.id },
              data: {
                endDate,
                startDate,
              },
            });
            updatedCount++;
            console.log(`   ✏️  Обновлена подписка ${type} (${description})`);
          } else {
            // Создаем новую подписку
            await prisma.subscription.create({
              data: {
                userId: user.id,
                type,
                startDate,
                endDate,
                active: true,
              },
            });
            createdCount++;
            console.log(`   ✅ Создана подписка ${type} (${description})`);
          }
        } catch (error) {
          console.error(`   ❌ Ошибка при создании подписки ${type}:`, error);
        }
      }
    }

    console.log("\n🎉 Создание тестовых подписок завершено!");
    console.log(`📊 Статистика:`);
    console.log(`   Создано новых подписок: ${createdCount}`);
    console.log(`   Обновлено существующих: ${updatedCount}`);
    console.log(`   Всего пользователей: ${users.length}`);

    // Показываем созданные подписки
    console.log("\n📋 Проверка созданных подписок:");
    const allSubscriptions = await prisma.subscription.findMany({
      where: {
        active: true,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: [{ endDate: "asc" }, { type: "asc" }],
    });

    allSubscriptions.forEach((subscription) => {
      const daysUntilExpiry = Math.ceil(
        (subscription.endDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );

      let status = "";
      if (daysUntilExpiry < 0) {
        status = "❌ ПРОСРОЧЕНА";
      } else if (daysUntilExpiry === 0) {
        status = "⚠️  ИСТЕКАЕТ СЕГОДНЯ";
      } else if (daysUntilExpiry === 1) {
        status = "🔔 ИСТЕКАЕТ ЗАВТРА";
      } else {
        status = `✅ Осталось ${daysUntilExpiry} дней`;
      }

      console.log(
        `   ${subscription.user.username} | ${subscription.type} | ${subscription.endDate.toLocaleDateString()} | ${status}`
      );
    });

    console.log("\n✅ Скрипт успешно выполнен!");
  } catch (error) {
    console.error("❌ Произошла ошибка:", error);
    throw error;
  }
}

/**
 * Функция для проверки подписок, истекающих завтра
 * Эта функция имитирует проверку, которая будет выполняться в 10 утра
 */
async function checkExpiringSubscriptions() {
  try {
    console.log("\n🔔 Проверка подписок, истекающих завтра...");

    const tomorrow = endOfDay(addDays(new Date(), 1));
    const tomorrowStart = startOfDay(addDays(new Date(), 1));

    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        active: true,
        endDate: {
          gte: tomorrowStart,
          lte: tomorrow,
        },
      },
      include: {
        user: {
          select: {
            username: true,
            chatId: true,
          },
        },
      },
    });

    console.log(
      `📊 Найдено подписок, истекающих завтра: ${expiringSubscriptions.length}`
    );

    if (expiringSubscriptions.length > 0) {
      console.log("⚠️  Подписки, которые истекают завтра:");
      expiringSubscriptions.forEach((subscription) => {
        console.log(
          `   👤 ${subscription.user.username} | ${subscription.type} | ${subscription.endDate.toLocaleString()}`
        );
      });

      console.log("\n💬 Уведомления будут отправлены завтра в 10:00!");
    } else {
      console.log("✅ Подписок, истекающих завтра, не найдено.");
    }
  } catch (error) {
    console.error("❌ Ошибка при проверке истекающих подписок:", error);
    throw error;
  }
}

// Основная функция выполнения скрипта
async function main() {
  try {
    await createTestSubscriptions();
    await checkExpiringSubscriptions();
  } catch (error) {
    console.error("❌ Критическая ошибка:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт, если файл выполняется напрямую
if (require.main === module) {
  main();
}

export { createTestSubscriptions, checkExpiringSubscriptions };
