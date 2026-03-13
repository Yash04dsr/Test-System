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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardAnalytics = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const TestAttempt_1 = __importDefault(require("../models/TestAttempt"));
const getDashboardAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (typeof userId !== 'string' || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        // Fetch all test attempts for the user
        const attempts = yield TestAttempt_1.default.find({ userId }).populate('answers.questionId');
        if (attempts.length === 0) {
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
        // Trend metrics
        const performanceTrends = attempts.map(attempt => ({
            date: attempt.completedAt,
            score: attempt.totalScore
        })).sort((a, b) => a.date.getTime() - b.date.getTime());
        attempts.forEach(attempt => {
            totalScore += attempt.totalScore;
            totalQuestions += attempt.answers.length;
            attempt.answers.forEach((ans) => {
                const question = ans.questionId;
                if (!question)
                    return;
                const topic = question.topic || 'General';
                const difficulty = question.difficulty || 'Medium';
                // Topic stats
                if (!topicStats[topic]) {
                    topicStats[topic] = { total: 0, correct: 0, timeSpent: 0 };
                }
                topicStats[topic].total += 1;
                topicStats[topic].timeSpent += ans.timeSpentSeconds;
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
            return { subject: topic, A: accuracy, fullMark: 100 };
        });
        // 2. Pie Chart Data (Accuracy by Difficulty)
        const pieData = Object.keys(difficultyStats)
            .filter(diff => difficultyStats[diff].total > 0)
            .map(diff => {
            const stats = difficultyStats[diff];
            return { name: diff, value: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0 };
        });
        // 3. Time Spent Analysis
        const timeSpentAnalysis = Object.keys(topicStats).map(topic => {
            const stats = topicStats[topic];
            const avgTime = stats.total > 0 ? (stats.timeSpent / stats.total) : 0;
            return { topic, averageTimeSeconds: avgTime };
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
            overallAccuracy: (totalScore / totalQuestions) * 100,
            totalAttempts: attempts.length,
            radarData,
            pieData,
            performanceTrends,
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
