'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useAuth, type AuthState } from '@/hooks/useAuth';
import { useAuthApi } from '@/hooks/useAuthApi';

interface AuthContextValue extends AuthState {
  signInWithEmail: (email: string, password: string) => Promise<unknown>;
  signUpWithEmail: (email: string, password: string) => Promise<unknown>;
  signInWithGoogle: () => Promise<unknown>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  useAuthApi();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within <AuthProvider>');
  }
  return ctx;
}
