import { db } from '../server';

export interface IUser {
  id?: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  createdAt: Date;
}

export const usersCollection = db.collection('users');
