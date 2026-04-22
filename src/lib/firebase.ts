import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "build-time-mock-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "build-time-mock-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "build-time-mock-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "build-time-mock-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "build-time-mock-sender",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "build-time-mock-app",
};

// Static Environment Validation (Next.js requires static access for NEXT_PUBLIC vars)
const isConfigIncomplete = 
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
  !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 
  !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 
  !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 
  !process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 
  !process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

if (isConfigIncomplete) {
  console.error("CRITICAL ERROR: Firebase Environment Variables are missing. Please check your .env.local");
}


// Initialize Firebase
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
export default app;

