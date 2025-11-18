import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, logEvent, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

function assertFirebaseConfig(): void {
  const missingKey = Object.entries(firebaseConfig).find(([, value]) => !value);
  if (import.meta.env.DEV && missingKey) {
    console.warn(`[firebase] Missing config value for ${missingKey[0]}. Analytics disabled until configured.`);
  }
}
assertFirebaseConfig();

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const firestore = getFirestore(app);

let analytics: Analytics | null = null;

if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('[firebase] Failed to initialize analytics:', error);
  }
}
export function logFeedbackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
}
export { app, firestore, analytics };

