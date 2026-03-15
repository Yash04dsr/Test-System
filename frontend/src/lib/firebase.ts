import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQszMNMyPmhcW9yApWsddE1f1fuk43QeU",
  authDomain: "test-app-d22b2.firebaseapp.com",
  projectId: "test-app-d22b2",
  storageBucket: "test-app-d22b2.firebasestorage.app",
  messagingSenderId: "690374702739",
  appId: "1:690374702739:web:d93372cde032b9545e3f66",
  measurementId: "G-KTPXF54DE0"
};

// Initialize Firebase (Singleton pattern for Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
