import { Router } from 'express';
import { isAdmin } from '../middleware/isAdmin';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic
} from '../controllers/topic.controller';

const router = Router();

router.get('/', authMiddleware, getTopics);
router.get('/:id', authMiddleware, getTopicById);

router.post('/', authMiddleware, isAdmin, createTopic);
router.put('/:id', authMiddleware, isAdmin, updateTopic);
router.delete('/:id', authMiddleware, isAdmin, deleteTopic);

export default router; 