"use client";

import React, {
  useContext,
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, isConfigured } from "../firebase";
import { docExists } from "../_db/db";

interface AuthContextType {
  user: FirebaseUser | null;
  isGoogleSignInLoading: boolean;
  isLogOutLoading: boolean;
  googleSignIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isGoogleSignInLoading, setIsGoogleSignInLoading] = useState(false);
  const [isLogOutLoading, setIsLogOutLoading] = useState(false);

  const googleSignIn = async () => {
    if (!isConfigured || !auth) {
      console.warn("Firebase is not configured. Cannot sign in.");
      return;
    }
    setIsGoogleSignInLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } finally {
      setIsGoogleSignInLoading(false);
    }
  };

  const logOut = async () => {
    if (!isConfigured || !auth) {
      console.warn("Firebase is not configured. Cannot sign out.");
      return;
    }
    setIsLogOutLoading(true);
    try {
      await signOut(auth);
    } finally {
      setIsLogOutLoading(false);
    }
  };

  useEffect(() => {
    if (!isConfigured || !auth) {
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser !== null) {
        docExists(currentUser.uid, currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isGoogleSignInLoading,
        isLogOutLoading,
        googleSignIn,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
