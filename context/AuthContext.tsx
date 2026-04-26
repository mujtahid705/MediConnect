import * as AuthService from "@/lib/auth-service";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface AuthContextType {
  user: AuthService.User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUpAsPatient: (
    email: string,
    password: string,
    patientData: AuthService.PatientData,
  ) => Promise<void>;
  signUpAsDoctor: (
    email: string,
    password: string,
    doctorData: AuthService.DoctorData,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthService.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize user from session on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user: currentUser } = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const result = await AuthService.signInWithEmail(email, password);
      if (result.error) {
        setError(result.error);
        throw new Error(result.error);
      }
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  };

  const signUpAsPatient = async (
    email: string,
    password: string,
    patientData: AuthService.PatientData,
  ) => {
    setError(null);
    setLoading(true);
    try {
      const result = await AuthService.signUpPatient(
        email,
        password,
        patientData,
      );
      if (result.error) {
        setError(result.error);
        throw new Error(result.error);
      }
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  };

  const signUpAsDoctor = async (
    email: string,
    password: string,
    doctorData: AuthService.DoctorData,
  ) => {
    setError(null);
    setLoading(true);
    try {
      const result = await AuthService.signUpDoctor(
        email,
        password,
        doctorData,
      );
      if (result.error) {
        setError(result.error);
        throw new Error(result.error);
      }
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await AuthService.signOut();
      if (result.error) {
        setError(result.error);
        throw new Error(result.error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUpAsPatient,
        signUpAsDoctor,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
