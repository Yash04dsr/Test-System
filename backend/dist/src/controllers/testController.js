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
exports.getQuestions = exports.submitTest = void 0;
const zod_1 = require("zod");
const Question_1 = require("../models/Question");
const TestAttempt_1 = require("../models/TestAttempt");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const submitTestSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    answers: zod_1.z.array(zod_1.z.object({
        questionId: zod_1.z.string().min(1, 'Question ID is required'),
        selectedOptionIndex: zod_1.z.number().nullable(),
        timeSpentSeconds: zod_1.z.number().min(0)
    }))
});
const submitTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedUrlParams = submitTestSchema.safeParse(req.body);
        if (!parsedUrlParams.success) {
            res.status(400).json({ errors: parsedUrlParams.error.issues });
            return;
        }
        const { userId, answers } = parsedUrlParams.data;
        let totalScore = 0;
        const evaluatedAnswers = [];
        // Evaluate each answer
        for (const ans of answers) {
            const questionDoc = yield Question_1.questionsCollection.doc(ans.questionId).get();
            if (!questionDoc.exists)
                continue;
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
            completedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp()
        };
        const newAttemptRef = yield TestAttempt_1.testAttemptsCollection.add(testAttemptData);
        res.status(201).json({
            message: 'Test submitted and evaluated successfully',
            attemptId: newAttemptRef.id,
            score: totalScore
        });
    }
    catch (error) {
        console.error('Error submitting test:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.submitTest = submitTest;
const getQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const questionsSnapshot = yield Question_1.questionsCollection.get();
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getQuestions = getQuestions;
