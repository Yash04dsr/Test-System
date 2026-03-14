"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionsCollection = void 0;
const server_1 = require("../server");
exports.questionsCollection = server_1.db.collection('questions');
