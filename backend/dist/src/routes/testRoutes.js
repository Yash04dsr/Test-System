"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const testController_1 = require("../controllers/testController");
const router = (0, express_1.Router)();
// Public routes
router.get('/questions', testController_1.getQuestions);
router.post('/submit', testController_1.submitTest);
// Admin routes
router.get('/admin/questions', testController_1.getAdminQuestions);
router.post('/questions', testController_1.createQuestion);
router.put('/questions/:id', testController_1.updateQuestion);
router.delete('/questions/:id', testController_1.deleteQuestion);
exports.default = router;
