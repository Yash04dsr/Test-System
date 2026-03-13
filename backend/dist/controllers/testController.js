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
const Question_1 = __importDefault(require("../models/Question"));
const TestAttempt_1 = __importDefault(require("../models/TestAttempt"));
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
            const question = yield Question_1.default.findById(ans.questionId);
            if (!question)
                continue;
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
        const testAttempt = new TestAttempt_1.default({
            userId,
            answers: evaluatedAnswers,
            totalScore
        });
        yield testAttempt.save();
        res.status(201).json({
            message: 'Test submitted and evaluated successfully',
            attemptId: testAttempt._id,
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
        const questions = yield Question_1.default.find({});
        // Exclude correctOptionIndex for actual test taking
        const safeQuestions = questions.map(q => ({
            _id: q._id,
            text: q.text,
            options: q.options,
            topic: q.topic,
            difficulty: q.difficulty
        }));
        res.status(200).json(safeQuestions);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getQuestions = getQuestions;
