import { Request, Response } from 'express';
import { db } from '../config/firebase';

/**
 * Returns all users with role='student' from the Firestore 'users' collection.
 * Used by the Admin "Manage Enrollments" modal.
 */
export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const usersSnapshot = await db.collection('users').where('role', '==', 'student').get();

    const students = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || doc.data().email || `User ${doc.id.substring(0, 6)}`,
      email: doc.data().email || ''
    }));

    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
