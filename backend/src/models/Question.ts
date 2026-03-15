import { db } from '../config/firebase';

export interface IQuestion {
  id?: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  courseId: string; // Mandates that this question belongs to a specific course
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const questionsCollection = db.collection('questions');
