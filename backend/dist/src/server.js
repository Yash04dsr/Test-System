"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const testRoutes_1 = __importDefault(require("./routes/testRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
dotenv_1.default.config();
// Initialize Firebase Admin
if (!firebase_admin_1.default.apps.length) {
    try {
        // Note: If deploying to Vercel, service account JSON is usually base64 encoded as an environment variable,
        // or passed directly. We fall back to applicationDefault() for local environments.
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('ascii'));
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin initialized with base64 service account.');
        }
        else {
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.applicationDefault(),
            });
            console.log('Firebase Admin initialized with default credentials.');
        }
    }
    catch (error) {
        console.error('Firebase initialization error', error);
    }
}
exports.db = firebase_admin_1.default.firestore();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/tests', testRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Smart Evaluation System API is running on Firebase.' });
});
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
exports.default = app;
