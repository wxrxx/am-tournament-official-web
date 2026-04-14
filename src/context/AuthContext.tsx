"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from "firebase/auth";

// This interface mirrors the subset of Clerk's user object we might need
export interface User {
  id: string;
  fullName: string;
  primaryEmailAddress: { emailAddress: string };
  imageUrl?: string;
}

interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: User | null;
  signIn: (email: string, pass: string) => Promise<boolean>;
  signUp: (email: string, pass: string, fullName: string) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoaded: false,
  isSignedIn: false,
  user: null,
  signIn: async () => false,
  signUp: async () => false,
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for mock user first regardless of Firebase config
    const savedUser = localStorage.getItem("am_mock_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoaded(true);
      return;
    }

    if (!isFirebaseConfigured) {
      setIsLoaded(true);
      return;
    }

    // Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth!, (firebaseUser) => {
      // Only set user from Firebase if no mock user exists (safety check)
      if (firebaseUser && !localStorage.getItem("am_mock_user")) {
        setUser({
          id: firebaseUser.uid,
          fullName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          primaryEmailAddress: { emailAddress: firebaseUser.email || "" },
          imageUrl: firebaseUser.photoURL || undefined,
        });
      } else if (!localStorage.getItem("am_mock_user")) {
        setUser(null);
      }
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    // 1. Check for Mock Password First (Bypass Firebase)
    if (pass === "am2026") {
      // Sign out from Firebase if currently signed in to prevent state mixing
      if (isFirebaseConfigured && auth?.currentUser) {
        await firebaseSignOut(auth);
      }

      const mockUser: User = {
        id: "mock_user_1",
        fullName: email.split("@")[0] || "Admin",
        primaryEmailAddress: { emailAddress: email.includes("@") ? email : `${email}@mock.com` },
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };
      
      setUser(mockUser);
      localStorage.setItem("am_mock_user", JSON.stringify(mockUser));
      return true;
    }

    // 2. Real Firebase Auth
    if (isFirebaseConfigured) {
      try {
        await signInWithEmailAndPassword(auth!, email, pass);
        // Clear mock session if logging in with real Firebase
        localStorage.removeItem("am_mock_user");
        return true;
      } catch (error) {
        console.error("Firebase Sign In Error:", error);
        return false;
      }
    }

    return false;
  };

  const signUp = async (email: string, pass: string, fullName: string) => {
    if (isFirebaseConfigured) {
      try {
        const res = await createUserWithEmailAndPassword(auth!, email, pass);
        await updateProfile(res.user, { displayName: fullName });
        
        // State will update via onAuthStateChanged listener
        localStorage.removeItem("am_mock_user");
        return true;
      } catch (error) {
        console.error("Firebase Sign Up Error:", error);
        return false;
      }
    }
    return false;
  };

  const signOut = async () => {
    if (isFirebaseConfigured) {
      await firebaseSignOut(auth!);
    }
    setUser(null);
    localStorage.removeItem("am_mock_user");
  };

  const value = {
    isLoaded,
    isSignedIn: !!user,
    user,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

