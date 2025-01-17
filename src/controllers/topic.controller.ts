import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors/AppError';
import prisma from '../prisma/prismaClient';

// Получить все топики с учетом подписки пользователя
export const getTopics = asyncHandler(async (req: Request, res: Response) => {
  const { folderId } = req.query; // Получаем опциональный параметр folderId
  const userId = req.user!.id;

  // Если указан folderId, проверяем существование папки
  if (folderId) {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId as string }
    });

    if (!folder) {
      throw new NotFoundError('Folder not found');
    }
  }

  // Получаем активные подписки пользователя
  const userSubscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      active: true,
      endDate: { gt: new Date() }
    }
  });

  const subscribedTypes = userSubscriptions.map(sub => sub.type);

  // Формируем запрос с учетом опционального folderId
  const topics = await prisma.topic.findMany({
    where: folderId ? { folderId: folderId as string } : undefined,
    include: {
      folder: true,
      lessons: {
        orderBy: {
          orderNumber: 'asc'
        }
      },
      userTopics: {
        where: { userId }
      }
    }
  });

  // Обрабатываем топики
  const processedTopics = topics.map(topic => ({
    ...topic,
    progress: topic.userTopics[0]?.progress || 0,
    isAccessible: subscribedTypes.includes(topic.folder.type),
    lessonsCount: topic.lessons.length,
    // Показываем только базовую информацию о уроках если нет подписки
    lessons: subscribedTypes.includes(topic.folder.type) 
      ? topic.lessons 
      : topic.lessons.map(lesson => ({
          id: lesson.id,
          name: lesson.name,
          about: lesson.about,
          isSubscriptionRequired: lesson.isSubscriptionRequired
        }))
  }));

  res.json(processedTopics);
});
// Получить топик по ID
export const getTopicById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      folder: true,
      lessons: {
        orderBy: {
          orderNumber: 'asc'
        },
        include: {
          userLessons: {
            where: { userId }
          }
        }
      },
      userTopics: {
        where: { userId }
      }
    }
  });

  if (!topic) {
    throw new NotFoundError('Topic not found');
  }

  // Проверяем подписку
  const hasSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      type: topic.folder.type,
      active: true,
      endDate: { gt: new Date() }
    }
  });

  const processedTopic = {
    ...topic,
    progress: topic.userTopics[0]?.progress || 0,
    isAccessible: !!hasSubscription,
    lessonsCount: topic.lessons.length,
    lessons: topic.lessons.map(lesson => ({
      ...lesson,
      isCompleted: lesson.userLessons[0]?.completed || false,
      watchedAt: lesson.userLessons[0]?.watchedAt || null,
      // Скрываем видео для уроков, требующих подписку
      video: (!hasSubscription && lesson.isSubscriptionRequired) ? null : lesson.video
    }))
  };

  res.json(processedTopic);
});

// Получить прогресс топика
export const getTopicProgress = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const userTopic = await prisma.userTopic.findUnique({
    where: {
      userId_topicId: {
        userId,
        topicId: id
      }
    }
  });

  res.json({ progress: userTopic?.progress || 0 });
});

// Создать топик (админ)
export const createTopic = asyncHandler(async (req: Request, res: Response) => {
  const { name, about, description, folderId } = req.body;

  if (!name || !folderId) {
    throw new ValidationError('Name and folderId are required');
  }

  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
  });

  if (!folder) {
    throw new ValidationError(`Folder with ID ${folderId} not found`);
  }

  // Создаем новую тему
  const topic = await prisma.topic.create({
    data: {
      name,
      about,
      description,
      folderId,
      type: folder.type, // Обязательное поле
    },
    include: {
      folder: true, // Включаем данные папки в ответ
    },
  });

  res.status(201).json(topic);
});

// Обновить топик (админ)
export const updateTopic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, about, description, folderId } = req.body;

  const existingTopic = await prisma.topic.findUnique({
    where: { id }
  });

  if (!existingTopic) {
    throw new NotFoundError('Topic not found');
  }

  const updatedTopic = await prisma.topic.update({
    where: { id },
    data: {
      name,
      about,
      description,
      folderId
    },
    include: {
      folder: true
    }
  });

  res.json(updatedTopic);
});

// Удалить топик (админ)
export const deleteTopic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingTopic = await prisma.topic.findUnique({
    where: { id }
  });

  if (!existingTopic) {
    throw new NotFoundError('Topic not found');
  }

  // Удаляем все связанные записи
  await prisma.$transaction([
    // Удаляем прогресс пользователей по урокам
    prisma.userLesson.deleteMany({
      where: {
        lesson: {
          topicId: id
        }
      }
    }),
    // Удаляем прогресс пользователей по топику
    prisma.userTopic.deleteMany({
      where: { topicId: id }
    }),
    // Удаляем уроки
    prisma.lesson.deleteMany({
      where: { topicId: id }
    }),
    // Удаляем сам топик
    prisma.topic.delete({
      where: { id }
    })
  ]);

  res.status(204).send();
});
