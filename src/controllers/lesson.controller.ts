import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors/AppError';
import prisma from '../prisma/prismaClient';

export const createLesson = asyncHandler(async (req: Request, res: Response) => {
  const { 
    name, 
    video, 
    about, 
    description, 
    tasks, 
    isSubscriptionRequired,
    topicId 
  } = req.body;

  // Проверяем обязательные поля
  if (!name || !video || !topicId) {
    throw new ValidationError('Name, video and topicId are required');
  }

  // Получаем тип контента из папки через топик
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { folder: true }
  });

  if (!topic) {
    throw new NotFoundError('Topic not found');
  }

  // Находим последний порядковый номер в топике
  const lastLesson = await prisma.lesson.findFirst({
    where: { topicId },
    orderBy: { orderNumber: 'desc' }
  });

  const nextOrderNumber = (lastLesson?.orderNumber || 0) + 1;

  // Создаем урок с типом из папки
  const lesson = await prisma.lesson.create({
    data: {
      name,
      video,
      about,
      description,
      tasks: tasks || [],
      orderNumber: nextOrderNumber,
      isSubscriptionRequired: isSubscriptionRequired ?? true,
      type: topic.folder.type, // Устанавливаем тип из папки
      topicId
    },
    include: {
      topic: {
        include: {
          folder: true
        }
      }
    }
  });

  res.status(201).json(lesson);
});

export const getAdminLessons = asyncHandler(async (req: Request, res: Response) => {
  const topicId = req.query.type as string | undefined;

  const lessons = await prisma.lesson.findMany({
    where: {
      topicId
    },
    include: {
      topic: {
        include: {
          folder: true
        }
      }
    },
    orderBy: {
      orderNumber: 'asc'
    }
  });

  res.json(lessons);
});

export const markLessonAsCompleted = asyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params; // Получаем ID урока из параметров
  const userId = req.user!.id; // ID текущего пользователя

  // Проверяем, существует ли урок
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    throw new NotFoundError("Lesson not found");
  }

  // Проверяем, есть ли уже запись о прохождении урока
  const userLesson = await prisma.userLesson.findUnique({
    where: {
      userId_lessonId: { // composite key из схемы Prisma
        userId,
        lessonId,
      },
    },
  });

  if (userLesson) {
    // Если запись существует, обновляем её (на случай, если она уже была создана, но урок не отмечен как завершённый)
    const updatedUserLesson = await prisma.userLesson.update({
      where: {
        id: userLesson.id,
      },
      data: {
        completed: true, // Отмечаем как завершённый
        watchedAt: new Date(), // Ставим текущую дату
      },
    });

    return res.status(200).json({ message: "Lesson marked as completed", data: updatedUserLesson });
  }

  // Если записи нет, создаём новую
  const newUserLesson = await prisma.userLesson.create({
    data: {
      userId,
      lessonId,
      completed: true, // Отмечаем как завершённый
      watchedAt: new Date(), // Ставим текущую дату
    },
  });

  res.status(201).json({ message: "Lesson marked as completed", data: newUserLesson });
});

export const getLessonById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const currentLesson = await prisma.lesson.findUnique({
    where: { id },
    include: { topic: true },
  });

  if (!currentLesson) {
    throw new NotFoundError('Lesson not found');
  }

  await prisma.lesson.update({
    where: { id },
    data: {
      views: currentLesson.views + 1,
    },
  });

  const [previousLesson, nextLesson] = await Promise.all([
    prisma.lesson.findFirst({
      where: {
        topicId: currentLesson.topicId, // Уроки из того же топика
        orderNumber: { lt: currentLesson.orderNumber }, // Меньший номер
      },
      orderBy: { orderNumber: 'desc' }, // Предыдущий (по убыванию)
      select: { id: true }, // Только ID
    }),
    prisma.lesson.findFirst({
      where: {
        topicId: currentLesson.topicId, // Уроки из того же топика
        orderNumber: { gt: currentLesson.orderNumber }, // Больший номер
      },
      orderBy: { orderNumber: 'asc' }, // Следующий (по возрастанию)
      select: { id: true }, // Только ID
    }),
  ]);

  res.json({
    lesson: currentLesson,
    previousLessonId: previousLesson?.id || null,
    nextLessonId: nextLesson?.id || null,
  });
});

export const getUserLessons = asyncHandler(async (req: Request, res: Response) => {
  const { topicId } = req.params;
  const userId = req.user!.id;

  // Получаем тему и тип контента
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { folder: true }
  });

  if (!topic) {
    throw new NotFoundError('Topic not found');
  }

  // Проверяем подписку пользователя на тип контента
  const hasSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      type: topic.folder.type,
      active: true,
      endDate: { gt: new Date() }
    }
  });

  const lessons = await prisma.lesson.findMany({
    where: {
      topicId,
      // Если нет подписки, показываем только бесплатные уроки
      ...(!hasSubscription && { isSubscriptionRequired: false })
    },
    include: {
      userLessons: {
        where: { userId }
      }
    },
    orderBy: {
      orderNumber: 'asc'
    }
  });

  // Форматируем ответ для пользователя
  const formattedLessons = lessons.map(lesson => ({
    ...lesson,
    isCompleted: lesson.userLessons.length > 0 ? lesson.userLessons[0].completed : false,
    watchedAt: lesson.userLessons[0]?.watchedAt || null,
    // Скрываем видео для платных уроков без подписки
    video: (!hasSubscription && lesson.isSubscriptionRequired) ? null : lesson.video
  }));

  res.json(formattedLessons);
});


export const updateLesson = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    name, 
    video, 
    about, 
    description, 
    tasks, 
    isSubscriptionRequired,
    orderNumber,
    topicId 
  } = req.body;

  // Проверяем существование урока
  const existingLesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      topic: {
        include: {
          folder: true
        }
      }
    }
  });

  if (!existingLesson) {
    throw new NotFoundError('Lesson not found');
  }

  // Если меняется топик, получаем новый тип из папки
  let type = existingLesson.type;
  if (topicId && topicId !== existingLesson.topicId) {
    const newTopic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: { folder: true }
    });
    if (!newTopic) {
      throw new NotFoundError('New topic not found');
    }
    type = newTopic.folder.type;
  }

  const updatedLesson = await prisma.lesson.update({
    where: { id },
    data: {
      name,
      video,
      about,
      description,
      tasks,
      isSubscriptionRequired,
      orderNumber,
      topicId,
      type
    },
    include: {
      topic: {
        include: {
          folder: true
        }
      }
    }
  });

  res.json(updatedLesson);
});

// Удаление урока (только для админа)
export const deleteLesson = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Проверяем существование урока
  const lesson = await prisma.lesson.findUnique({
    where: { id }
  });

  if (!lesson) {
    throw new NotFoundError('Lesson not found');
  }

  // Удаляем все связанные записи в транзакции
  await prisma.$transaction([
    // Сначала удаляем все записи о прохождении урока
    prisma.userLesson.deleteMany({
      where: { lessonId: id }
    }),
    // Затем удаляем сам урок
    prisma.lesson.delete({
      where: { id }
    })
  ]);

  res.status(204).send();
});