import { Router } from 'express';
import { isAdmin } from '../middleware/isAdmin';
import { checkSubscription } from '../middleware/cheak-subscription';

import {
  getAdminLessons,
  getUserLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonById,
  markLessonAsCompleted
} from '../controllers/lesson.controller';

const router = Router();

router.get('/admin', isAdmin, getAdminLessons);
router.get('/', getUserLessons);
router.get('/:id', checkSubscription, getLessonById);
router.post("/:lessonId/complete", checkSubscription, markLessonAsCompleted);

router.get('/admin', isAdmin, getAdminLessons);
router.post('/', isAdmin, createLesson);
router.put('/:id', isAdmin, updateLesson);
router.delete('/:id', isAdmin, deleteLesson);

export default router; 