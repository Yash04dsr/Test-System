import { Router } from 'express';
import { getAllStudents } from '../controllers/userController';

const router = Router();

router.get('/students', getAllStudents);

export default router;
