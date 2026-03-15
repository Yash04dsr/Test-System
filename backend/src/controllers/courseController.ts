import { Request, Response } from 'express';
import { coursesCollection, ICourse } from '../models/Course';

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const coursesSnapshot = await coursesCollection.get();
    const courses = coursesSnapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
        res.status(400).json({ error: 'Course title is required' });
        return;
    }

    const newDoc = await coursesCollection.add({
      title,
      description: description || '',
      enrolledStudentIds: [],
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({ _id: newDoc.id, message: 'Course created successfully' });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, enrolledStudentIds } = req.body;

    if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid course ID' });
        return;
    }

    const payload: Partial<ICourse> = {};
    if (title !== undefined) payload.title = title;
    if (description !== undefined) payload.description = description;
    if (enrolledStudentIds !== undefined) payload.enrolledStudentIds = enrolledStudentIds;

    await coursesCollection.doc(id).update(payload);
    res.status(200).json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid course ID' });
        return;
    }

    await coursesCollection.doc(id).delete();
    // Implementation note: You may also want to delete all questions associated with this courseId here.
    
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
