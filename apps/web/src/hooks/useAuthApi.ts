'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';

export function useAuthApi() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        api.setAccessToken(token);
      } else {
        api.setAccessToken(null);
      }
    });
    return unsubscribe;
  }, []);
}
