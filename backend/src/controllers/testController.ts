import { Request, Response } from 'express';
import { z } from 'zod';
import { questionsCollection } from '../models/Question';
import { testAttemptsCollection, IAnswer } from '../models/TestAttempt';
import admin from 'firebase-admin';

const submitTestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  answers: z.array(
    z.object({
      questionId: z.string().min(1, 'Question ID is required'),
      selectedOptionIndex: z.number().nullable(),
      timeSpentSeconds: z.number().min(0)
    })
  )
});

export const submitTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedUrlParams = submitTestSchema.safeParse(req.body);
    if (!parsedUrlParams.success) {
      res.status(400).json({ errors: parsedUrlParams.error.issues });
      return;
    }

    const { userId, answers } = parsedUrlParams.data;

    let totalScore = 0;
    const evaluatedAnswers: IAnswer[] = [];

    // Evaluate each answer
    for (const ans of answers) {
      const questionDoc = await questionsCollection.doc(ans.questionId).get();
      if (!questionDoc.exists) continue;
      
      const question = questionDoc.data();
      if (question) {
        let isCorrect = false;
        if (ans.selectedOptionIndex !== null && ans.selectedOptionIndex === question.correctOptionIndex) {
          isCorrect = true;
          totalScore += 1; // Assuming +1 for correct
        }

        evaluatedAnswers.push({
          questionId: questionDoc.id,
          selectedOptionIndex: ans.selectedOptionIndex,
          timeSpentSeconds: ans.timeSpentSeconds,
          isCorrect
        });
      }
    }

    const testAttemptData = {
      userId,
      answers: evaluatedAnswers,
      totalScore,
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const newAttemptRef = await testAttemptsCollection.add(testAttemptData);

    res.status(201).json({
      message: 'Test submitted and evaluated successfully',
      attemptId: newAttemptRef.id,
      score: totalScore
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const questionsSnapshot = await questionsCollection.get();
    // Exclude correctOptionIndex for actual test taking
    const safeQuestions = questionsSnapshot.docs.map(doc => {
      const q = doc.data();
      return {
        _id: doc.id,
        text: q.text,
        options: q.options,
        topic: q.topic,
        difficulty: q.difficulty
      };
    });
    res.status(200).json(safeQuestions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
