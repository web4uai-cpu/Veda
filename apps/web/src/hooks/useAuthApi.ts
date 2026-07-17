'use client';

import { useEffect } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';

export function useAuthApi() {
  useEffect(() => {
    // onIdTokenChanged also fires when Firebase refreshes the ID token
    // (~hourly), so long sessions keep a valid bearer token.
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
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
