import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/analytics';

declare global {
  interface ImportMeta {
    env: Record<string, string | undefined>;
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDCSyI_3c0ZpljXp46drG31QbquLFXBpbo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'couple-sharing-household.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'couple-sharing-household',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'couple-sharing-household.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '978808382506',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:978808382506:web:cfb116d0ee139d9d860f53',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-1375FE59TL'
};

// Initialize Firebase safely
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

export const auth = app.auth();
export const db = app.firestore();

let analyticsInstance: any = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  try {
    analyticsInstance = firebase.analytics();
  } catch (e) {
    console.warn('Firebase analytics initialization skipped:', e);
  }
}
export const analytics = analyticsInstance;

export { firebase };