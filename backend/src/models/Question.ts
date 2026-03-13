import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  text: string;
  options: string[];
  correctOptionIndex: number;
  topic: string; // e.g., Algebra, Geometry, Physics
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const QuestionSchema: Schema = new Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true }
});

export default mongoose.model<IQuestion>('Question', QuestionSchema);
