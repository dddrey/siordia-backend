import { Router } from 'express';
import { addSubscription, removeAllSubscriptions, removeSubscriptionById } from "../controllers/subscription.controlle";

const router = Router();

router.post('/', addSubscription);

router.delete('/:userId', removeAllSubscriptions);

router.delete('/:subscriptionId', removeSubscriptionById);

export default router;  