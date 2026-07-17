import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    // onIdTokenChanged also fires on hourly token refresh — keeps the
    // API client's bearer token valid for long sessions.
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          api.setAccessToken(await user.getIdToken());
        } catch {
          api.setAccessToken(null);
        }
      } else {
        api.setAccessToken(null);
      }
      setState({ user, loading: false });
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
