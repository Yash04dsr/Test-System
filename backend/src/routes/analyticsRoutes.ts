import { Router } from 'express';
import { getDashboardAnalytics, getAdminGlobalAnalytics, getAdminStudents } from '../controllers/analyticsController';

const router = Router();

router.get('/dashboard/:userId', getDashboardAnalytics);

// Admin Routes
router.get('/admin/global', getAdminGlobalAnalytics);
router.get('/admin/students', getAdminStudents);

export default router;
