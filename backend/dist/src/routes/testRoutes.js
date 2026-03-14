"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const testController_1 = require("../controllers/testController");
const router = (0, express_1.Router)();
router.get('/questions', testController_1.getQuestions);
router.post('/submit', testController_1.submitTest);
exports.default = router;
