"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStudents = exports.getAdminGlobalAnalytics = exports.getDashboardAnalytics = void 0;
const TestAttempt_1 = require("../models/TestAttempt");
const Question_1 = require("../models/Question");
const getDashboardAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (typeof userId !== 'string' || !userId) {
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        // Fetch all test attempts for the user
        const attemptsSnapshot = yield TestAttempt_1.testAttemptsCollection.where('userId', '==', userId).get();
        if (attemptsSnapshot.empty) {
            res.status(404).json({ message: 'No test attempts found for this user.' });
            return;
        }
        let totalScore = 0;
        let totalQuestions = 0;
        // Topic-wise metrics
        const topicStats = {};
        // Difficulty metrics
        const difficultyStats = {
            Easy: { total: 0, correct: 0 },
            Medium: { total: 0, correct: 0 },
            Hard: { total: 0, correct: 0 }
        };
        const attemptsData = attemptsSnapshot.docs.map(doc => {
            const data = doc.data();
            let completedAtDate;
            if (data.completedAt && data.completedAt.toDate) {
                completedAtDate = data.completedAt.toDate();
            }
            else if (data.completedAt) {
                completedAtDate = new Date(data.completedAt);
            }
            else {
                completedAtDate = new Date(); // fallback
            }
            return {
                date: completedAtDate,
                score: data.totalScore,
                answers: data.answers || []
            };
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
        const uniqueQuestionIds = new Set();
        attemptsData.forEach(attempt => {
            attempt.answers.forEach((ans) => uniqueQuestionIds.add(ans.questionId));
        });
        // Fetch question metadata
        const questionCache = {};
        if (uniqueQuestionIds.size > 0) {
            // Firestore can only batch 'in' queries up to 10 elements, so instead 
            // if large we just pull all questions or split into chunks. 
            // For simplicity we will fetch individual docs here in parallel, or get all questions if it's faster.
            // Given small scale expected, pulling all is fine.
            const allQuestionsSnapshot = yield Question_1.questionsCollection.get();
            allQuestionsSnapshot.forEach(qDoc => {
                questionCache[qDoc.id] = qDoc.data();
            });
        }
        attemptsData.forEach(attempt => {
            totalScore += attempt.score;
            totalQuestions += attempt.answers.length;
            attempt.answers.forEach((ans) => {
                const question = questionCache[ans.questionId];
                if (!question)
                    return;
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
        let strengths = [];
        let weaknesses = [];
        Object.keys(topicStats).forEach(topic => {
            const stats = topicStats[topic];
            const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
            if (accuracy >= 70)
                strengths.push(topic);
            else if (accuracy < 50)
                weaknesses.push(topic);
        });
        res.status(200).json({
            overallAccuracy: totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0,
            totalAttempts: attemptsData.length,
            radarData,
            pieData,
            performanceTrends,
            testHistory,
            timeSpentAnalysis,
            strengths,
            weaknesses
        });
    }
    catch (error) {
        console.error('Error in getDashboardAnalytics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getDashboardAnalytics = getDashboardAnalytics;
const getAdminGlobalAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const attemptsSnapshot = yield TestAttempt_1.testAttemptsCollection.get();
        const questionsSnapshot = yield Question_1.questionsCollection.count().get();
        // Quick count of unique users via a Set
        const uniqueStudents = new Set();
        let totalScore = 0;
        let totalQuestions = 0;
        attemptsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.userId)
                uniqueStudents.add(data.userId);
            totalScore += (data.totalScore || 0);
            if (data.answers)
                totalQuestions += data.answers.length;
        });
        const averageAccuracy = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
        res.status(200).json({
            totalStudents: uniqueStudents.size,
            totalTestsTaken: attemptsSnapshot.size,
            averageAccuracy,
            activeQuestions: questionsSnapshot.data().count
        });
    }
    catch (error) {
        console.error('Error in getAdminGlobalAnalytics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getAdminGlobalAnalytics = getAdminGlobalAnalytics;
const getAdminStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // In a real app we would have a usersCollection. 
        // Here we deduce students from attempts.
        const attemptsSnapshot = yield TestAttempt_1.testAttemptsCollection.get();
        const studentsMap = new Map();
        attemptsSnapshot.forEach(doc => {
            const data = doc.data();
            const uId = data.userId;
            if (!uId)
                return;
            const existing = studentsMap.get(uId) || { userId: uId, testsTaken: 0, totalScore: 0, totalQuestions: 0 };
            existing.testsTaken += 1;
            existing.totalScore += (data.totalScore || 0);
            if (data.answers)
                existing.totalQuestions += data.answers.length;
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
    }
    catch (error) {
        console.error('Error in getAdminStudents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getAdminStudents = getAdminStudents;
