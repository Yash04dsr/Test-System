"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersCollection = void 0;
const server_1 = require("../server");
exports.usersCollection = server_1.db.collection('users');
