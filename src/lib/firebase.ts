import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Static Environment Validation (Next.js requires static access for NEXT_PUBLIC vars)
const isConfigIncomplete = 
  !firebaseConfig.apiKey || 
  !firebaseConfig.authDomain || 
  !firebaseConfig.projectId || 
  !firebaseConfig.storageBucket || 
  !firebaseConfig.messagingSenderId || 
  !firebaseConfig.appId;

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

