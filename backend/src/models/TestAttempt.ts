import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
  questionId: mongoose.Types.ObjectId;
  selectedOptionIndex: number | null; // null if unvisited or left blank
  timeSpentSeconds: number;
  isCorrect: boolean;
}

export interface ITestAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  totalScore: number;
  completedAt: Date;
}

const AnswerSchema: Schema = new Schema({
  questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOptionIndex: { type: Number, default: null },
  timeSpentSeconds: { type: Number, required: true, default: 0 },
  isCorrect: { type: Boolean, required: true, default: false }
});

const TestAttemptSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [AnswerSchema],
  totalScore: { type: Number, required: true, default: 0 },
  completedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITestAttempt>('TestAttempt', TestAttemptSchema);
