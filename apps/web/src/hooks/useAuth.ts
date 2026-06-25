'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({ user, loading: false });
    });
    return unsubscribe;
  }, []);

  const signInWithEmail = useCallback(
    (email: string, password: string) =>
      signInWithEmailAndPassword(auth, email, password),
    [],
  );

  const signUpWithEmail = useCallback(
    (email: string, password: string) =>
      createUserWithEmailAndPassword(auth, email, password),
    [],
  );

  const signInWithGoogle = useCallback(() => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }, []);

  const signOut = useCallback(() => firebaseSignOut(auth), []);

  const getIdToken = useCallback(async () => {
    if (!state.user) return null;
    return state.user.getIdToken();
  }, [state.user]);

  return {
    user: state.user,
    loading: state.loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    getIdToken,
  };
}
