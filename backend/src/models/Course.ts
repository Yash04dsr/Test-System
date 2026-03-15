import { db } from '../config/firebase';

export interface ICourse {
  id?: string;
  title: string;
  description: string;
  enrolledStudentIds: string[]; // Array of Firestore User UIDs
  createdAt: Date;
}

export const coursesCollection = db.collection('courses');
