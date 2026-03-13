import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController';

const router = Router();

router.get('/dashboard/:userId', getDashboardAnalytics);

export default router;
