import { Request, Response } from 'express';
import { z } from 'zod';
import Question from '../models/Question';
import TestAttempt, { IAnswer } from '../models/TestAttempt';

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
      const question = await Question.findById(ans.questionId);
      if (!question) continue;

      let isCorrect = false;
      if (ans.selectedOptionIndex !== null && ans.selectedOptionIndex === question.correctOptionIndex) {
        isCorrect = true;
        totalScore += 1; // Assuming +1 for correct
      }

      evaluatedAnswers.push({
        questionId: question._id,
        selectedOptionIndex: ans.selectedOptionIndex,
        timeSpentSeconds: ans.timeSpentSeconds,
        isCorrect
      });
    }

    const testAttempt = new TestAttempt({
      userId,
      answers: evaluatedAnswers,
      totalScore
    });

    await testAttempt.save();

    res.status(201).json({
      message: 'Test submitted and evaluated successfully',
      attemptId: testAttempt._id,
      score: totalScore
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const questions = await Question.find({});
    // Exclude correctOptionIndex for actual test taking
    const safeQuestions = questions.map(q => ({
      _id: q._id,
      text: q.text,
      options: q.options,
      topic: q.topic,
      difficulty: q.difficulty
    }));
    res.status(200).json(safeQuestions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
