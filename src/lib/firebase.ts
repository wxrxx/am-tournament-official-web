import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// User instructed: MUST force redeploy logic after ENV is set
// MAKE SURE TO REDEPLOY IN VERCEL AFTER ADDING/UPDATING ENVIRONMENT VARIABLES
console.log('ENV CHECK:', { 
  cloudinary: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'missing', 
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? 'exists' : 'missing', 
  secret: process.env.CLOUDINARY_API_SECRET ? 'exists' : 'missing',
  firebase: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'exists' : 'missing'
});

// Check if Firebase keys are provided
// We enforce that if Cloudinary AND Firebase exist, we consider it configured
const isCloudinaryComplete = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && !!process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY && !!process.env.CLOUDINARY_API_SECRET;
export const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && isCloudinaryComplete;

let app: any;
if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export const auth = isFirebaseConfigured ? getAuth(app) : null;
export const db = isFirebaseConfigured ? getFirestore(app) : null;
export const storage = isFirebaseConfigured ? getStorage(app) : null;

export default app;
