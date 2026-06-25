import { initializeApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCDSjhe3DkFae8n1f8kRoAXNfE7e7cfuRA",
  authDomain: "veda-9a7d6.firebaseapp.com",
  projectId: "veda-9a7d6",
  storageBucket: "veda-9a7d6.firebasestorage.app",
  messagingSenderId: "822545763625",
  appId: "1:822545763625:web:5c2a57d7102afd0b013b38",
  measurementId: "G-SXEHYJCDFK",
};

const app = initializeApp(firebaseConfig);

let analytics: Analytics | undefined;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

const auth = getAuth(app);
const storage = getStorage(app);

export { app, analytics, auth, storage };
