"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  AuthError
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

export interface User {
  id: string;
  fullName: string;
  primaryEmailAddress: { emailAddress: string };
  imageUrl?: string;
  role: "admin" | "user";
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

// Cookie helpers
function setSessionCookie(uid: string): void {
  document.cookie = `__session=${uid}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function clearSessionCookie(): void {
  document.cookie = "__session=; path=/; max-age=0; SameSite=Lax";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch role from Firestore
        let role: "admin" | "user" = "user";
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            role = data.role === "admin" ? "admin" : "user";
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
        }

        setUser({
          id: firebaseUser.uid,
          fullName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          primaryEmailAddress: { emailAddress: firebaseUser.email || "" },
          imageUrl: firebaseUser.photoURL || undefined,
          role,
        });

        // Set session cookie for middleware
        setSessionCookie(firebaseUser.uid);
      } else {
        setUser(null);
        clearSessionCookie();
      }
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const getAuthErrorMessage = (error: AuthError) => {
    switch (error.code) {
      case "auth/wrong-password":
        return "รหัสผ่านไม่ถูกต้อง";
      case "auth/user-not-found":
        return "ไม่พบบัญชีนี้ในระบบ";
      case "auth/too-many-requests":
        return "ลองใหม่อีกครั้งในภายหลัง";
      case "auth/invalid-credential":
        return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      case "auth/email-already-in-use":
        return "อีเมลนี้มีบัญชีอยู่แล้ว";
      case "auth/weak-password":
        return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
      case "auth/invalid-email":
        return "รูปแบบอีเมลไม่ถูกต้อง";
      default:
        return "เกิดข้อผิดพลาดในการเชื่อมต่อ โปรดลองอีกครั้ง";
    }
  };

  const signIn = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (error: unknown) {
      const msg = getAuthErrorMessage(error as AuthError);
      toast.error(msg);
      console.error("Firebase Sign In Error:", error);
      return false;
    }
  };

  const signUp = async (email: string, pass: string, fullName: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: fullName });
      
      // Create User Document in Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        email,
        displayName: fullName,
        role: "user",
        banned: false,
        createdAt: serverTimestamp(),
      });

      return true;
    } catch (error: unknown) {
      const msg = getAuthErrorMessage(error as AuthError);
      toast.error(msg);
      console.error("Firebase Sign Up Error:", error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      clearSessionCookie();
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
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
