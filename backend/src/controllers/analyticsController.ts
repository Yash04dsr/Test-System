import { Request, Response } from 'express';
import { testAttemptsCollection } from '../models/TestAttempt';
import { questionsCollection } from '../models/Question';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (typeof userId !== 'string' || !userId) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    // Fetch all test attempts for the user
    const attemptsSnapshot = await testAttemptsCollection.where('userId', '==', userId).get();

    if (attemptsSnapshot.empty) {
      res.status(404).json({ message: 'No test attempts found for this user.' });
      return;
    }

    let totalScore = 0;
    let totalQuestions = 0;
    
    // Topic-wise metrics
    const topicStats: Record<string, { total: number; correct: number; timeSpent: number }> = {};
    
    // Difficulty metrics
    const difficultyStats: Record<string, { total: number; correct: number }> = {
      Easy: { total: 0, correct: 0 },
      Medium: { total: 0, correct: 0 },
      Hard: { total: 0, correct: 0 }
    };

    const attemptsData = attemptsSnapshot.docs.map(doc => {
        const data = doc.data();
        let completedAtDate;
        if (data.completedAt && data.completedAt.toDate) {
             completedAtDate = data.completedAt.toDate();
        } else if (data.completedAt) {
             completedAtDate = new Date(data.completedAt);
        } else {
             completedAtDate = new Date(); // fallback
        }
        return {
            date: completedAtDate,
            score: data.totalScore,
            answers: data.answers || []
        }
    });

    // Trend metrics and History table data
    const performanceTrends = attemptsData.map(attempt => ({
      date: attempt.date,
      score: attempt.score
    })).sort((a, b) => a.date.getTime() - b.date.getTime());

    const testHistory = attemptsData.map(attempt => {
      const accuracy = attempt.answers.length > 0 ? (attempt.score / attempt.answers.length) * 100 : 0;
      return {
        date: attempt.date,
        score: attempt.score,
        totalQuestions: attempt.answers.length,
        accuracy: Math.round(accuracy)
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime());

    // We need to fetch all relevant questions to build the topic metrics cache
    const uniqueQuestionIds = new Set<string>();
    attemptsData.forEach(attempt => {
        attempt.answers.forEach((ans: any) => uniqueQuestionIds.add(ans.questionId));
    });

    // Fetch question metadata
    const questionCache: Record<string, any> = {};
    if (uniqueQuestionIds.size > 0) {
        // Firestore can only batch 'in' queries up to 10 elements, so instead 
        // if large we just pull all questions or split into chunks. 
        // For simplicity we will fetch individual docs here in parallel, or get all questions if it's faster.
        // Given small scale expected, pulling all is fine.
        const allQuestionsSnapshot = await questionsCollection.get();
        allQuestionsSnapshot.forEach(qDoc => {
             questionCache[qDoc.id] = qDoc.data();
        });
    }

    attemptsData.forEach(attempt => {
      totalScore += attempt.score;
      totalQuestions += attempt.answers.length;

      attempt.answers.forEach((ans: any) => {
        const question = questionCache[ans.questionId];
        if (!question) return;

        const topic = question.topic || 'General';
        const difficulty = question.difficulty || 'Medium';

        // Topic stats
        if (!topicStats[topic]) {
          topicStats[topic] = { total: 0, correct: 0, timeSpent: 0 };
        }
        topicStats[topic].total += 1;
        topicStats[topic].timeSpent += (ans.timeSpentSeconds || 0);
        if (ans.isCorrect) {
          topicStats[topic].correct += 1;
        }

        // Difficulty stats
        if (difficultyStats[difficulty]) {
          difficultyStats[difficulty].total += 1;
          if (ans.isCorrect) {
            difficultyStats[difficulty].correct += 1;
          }
        }
      });
    });

    // Formatting for charts (Radar, Pie, Line)
    
    // 1. Radar Chart Data (Skill Balance by Topic)
    const radarData = Object.keys(topicStats).map(topic => {
      const stats = topicStats[topic];
      const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
      return { subject: topic, A: Math.round(accuracy), fullMark: 100 };
    });

    // 2. Pie Chart Data (Accuracy by Difficulty)
    const pieData = Object.keys(difficultyStats)
      .filter(diff => difficultyStats[diff].total > 0)
      .map(diff => {
        const stats = difficultyStats[diff];
        return { name: diff, value: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0 };
    });

    // 3. Time Spent Analysis
    const timeSpentAnalysis = Object.keys(topicStats).map(topic => {
      const stats = topicStats[topic];
      const avgTime = stats.total > 0 ? (stats.timeSpent / stats.total) : 0;
      return { topic, averageTimeSeconds: Math.round(avgTime) };
    });

    // Determine Strengths and Weaknesses
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    
    Object.keys(topicStats).forEach(topic => {
      const stats = topicStats[topic];
      const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
      if (accuracy >= 70) strengths.push(topic);
      else if (accuracy < 50) weaknesses.push(topic);
    });

    // Generate AI Study Plan
    let aiStudyPlan = "No AI plan generated. Keep practicing!";
    try {
      if (process.env.GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Act as an expert tutor. Analyze this student's performance:
        Strengths: ${strengths.join(', ') || 'None yet'}
        Weaknesses: ${weaknesses.join(', ') || 'None yet'}
        Overall Accuracy: ${totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0}%
        Write a very concise, engaging, 2-3 sentence personalized study plan for them.`;
        
        const result = await model.generateContent(prompt);
        aiStudyPlan = result.response.text();
      } else {
        // Fallback mock AI plan
        if (weaknesses.length > 0) {
          aiStudyPlan = `I recommend focusing heavily on ${weaknesses.join(' and ')}. Your foundation in ${strengths.join(', ') || 'other areas'} is looking solid, so dedicate your next few study sessions to these weak points to see the biggest score improvement.`;
        } else if (strengths.length > 0) {
          aiStudyPlan = `Great work! Your scores in ${strengths.join(', ')} are excellent. Keep taking comprehensive mock tests to maintain this high level of accuracy across the board.`;
        } else {
          aiStudyPlan = `Take a few more tests! We need a bit more data to identify your precise strengths and weaknesses.`;
        }
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
      aiStudyPlan = "Unable to generate study plan at this time.";
    }

    res.status(200).json({
      overallAccuracy: totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0,
      totalAttempts: attemptsData.length,
      radarData,
      pieData,
      performanceTrends,
      testHistory,
      timeSpentAnalysis,
      strengths,
      weaknesses,
      aiStudyPlan
    });
  } catch (error) {
    console.error('Error in getDashboardAnalytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminGlobalAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const attemptsSnapshot = await testAttemptsCollection.get();
    const questionsSnapshot = await questionsCollection.count().get();
    
    // Quick count of unique users via a Set
    const uniqueStudents = new Set<string>();
    let totalScore = 0;
    let totalQuestions = 0;

    attemptsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.userId) uniqueStudents.add(data.userId);
      totalScore += (data.totalScore || 0);
      if (data.answers) totalQuestions += data.answers.length;
    });

    const averageAccuracy = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;

    res.status(200).json({
      totalStudents: uniqueStudents.size,
      totalTestsTaken: attemptsSnapshot.size,
      averageAccuracy,
      activeQuestions: questionsSnapshot.data().count
    });
  } catch (error) {
    console.error('Error in getAdminGlobalAnalytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real app we would have a usersCollection. 
    // Here we deduce students from attempts.
    const attemptsSnapshot = await testAttemptsCollection.get();
    
    const studentsMap = new Map<string, { userId: string, testsTaken: number, totalScore: number, totalQuestions: number }>();

    attemptsSnapshot.forEach(doc => {
      const data = doc.data();
      const uId = data.userId;
      if (!uId) return;

      const existing = studentsMap.get(uId) || { userId: uId, testsTaken: 0, totalScore: 0, totalQuestions: 0 };
      
      existing.testsTaken += 1;
      existing.totalScore += (data.totalScore || 0);
      if (data.answers) existing.totalQuestions += data.answers.length;
      
      studentsMap.set(uId, existing);
    });

    // Format for frontend
    const studentList = Array.from(studentsMap.values()).map(s => {
      const accuracy = s.totalQuestions > 0 ? (s.totalScore / s.totalQuestions) * 100 : 0;
      return {
        id: s.userId,
        // Since we don't store User Names in DB currently, we extract mock names from ID pattern (e.g. atob)
        // For fallback we just say "Student {ID}"
        name: `User ${s.userId.substring(0, 5)}`,
        testsTaken: s.testsTaken,
        averageAccuracy: Math.round(accuracy)
      };
    });

    res.status(200).json(studentList);
  } catch (error) {
    console.error('Error in getAdminStudents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
