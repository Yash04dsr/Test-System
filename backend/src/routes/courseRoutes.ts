import { Router } from 'express';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../controllers/courseController';

const router = Router();

// In a real application, you would add authentication middleware here to protect these routes
router.get('/', getCourses);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;
