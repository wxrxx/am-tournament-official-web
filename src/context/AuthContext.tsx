"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoaded: false,
  isSignedIn: false,
  user: null,
  signIn: async () => false,
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // On mount, check localStorage for a saved mock session
    const savedUser = localStorage.getItem("am_mock_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoaded(true);
  }, []);

  const signIn = async (email: string, pass: string) => {
    // Mock login logic with a hardcoded password
    if (pass === "am2026") {
      const mockUser: User = {
        id: "mock_user_1",
        fullName: email.split("@")[0] || "User",
        primaryEmailAddress: { emailAddress: email },
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };
      setUser(mockUser);
      localStorage.setItem("am_mock_user", JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("am_mock_user");
  };

  const value = {
    isLoaded,
    isSignedIn: !!user,
    user,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook built to be analogous to Clerk's useUser() / useAuth()
export const useAuth = () => useContext(AuthContext);
