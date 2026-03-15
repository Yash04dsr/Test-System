import { Router } from 'express';
import { submitTest, getQuestions, getAdminQuestions, createQuestion, updateQuestion, deleteQuestion } from '../controllers/testController';

const router = Router();

// Public routes
router.get('/questions', getQuestions);
router.post('/submit', submitTest);

// Admin routes
router.get('/admin/questions', getAdminQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

export default router;
