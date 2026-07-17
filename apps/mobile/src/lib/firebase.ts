/**
 * Firebase (React Native) — Auth with AsyncStorage persistence so
 * sessions survive app restarts. Web config values are public by design.
 */
import { initializeApp } from 'firebase/app';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — getReactNativePersistence exists in the RN bundle of firebase/auth
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCDSjhe3DkFae8n1f8kRoAXNfE7e7cfuRA',
  authDomain: 'veda-9a7d6.firebaseapp.com',
  projectId: 'veda-9a7d6',
  storageBucket: 'veda-9a7d6.firebasestorage.app',
  messagingSenderId: '822545763625',
  appId: '1:822545763625:web:5c2a57d7102afd0b013b38',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { app };
