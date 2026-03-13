import { Router } from 'express';
import { submitTest, getQuestions } from '../controllers/testController';

const router = Router();

router.get('/questions', getQuestions);
router.post('/submit', submitTest);

export default router;
