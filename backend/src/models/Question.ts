import { db } from '../server';

export interface IQuestion {
  id?: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  topic: string; // e.g., Algebra, Geometry, Physics
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const questionsCollection = db.collection('questions');
