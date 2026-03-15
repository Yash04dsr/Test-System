import { db } from '../config/firebase';
import admin from 'firebase-admin';

export interface IAnswer {
  questionId: string;
  selectedOptionIndex: number | null; // null if unvisited or left blank
  timeSpentSeconds: number;
  isCorrect: boolean;
}

export interface ITestAttempt {
  id?: string;
  userId: string;
  answers: IAnswer[];
  totalScore: number;
  completedAt: Date | admin.firestore.Timestamp;
}

export const testAttemptsCollection = db.collection('testAttempts');
