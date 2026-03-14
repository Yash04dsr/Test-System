import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

import testRoutes from './routes/testRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Note: If deploying to Vercel, service account JSON is usually base64 encoded as an environment variable,
    // or passed directly. We fall back to applicationDefault() for local environments.
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('ascii')
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized with base64 service account.');
    } else {
      admin.initializeApp({
         credential: admin.credential.applicationDefault(),
      });
      console.log('Firebase Admin initialized with default credentials.');
    }
  } catch (error) {
    console.error('Firebase initialization error', error);
  }
}

export const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/tests', testRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Smart Evaluation System API is running on Firebase.' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
