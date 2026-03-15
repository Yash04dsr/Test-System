import admin from 'firebase-admin';
import dotenv from 'dotenv';

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
