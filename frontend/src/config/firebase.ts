import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
if (requiredConfig.some((key) => !firebaseConfig[key])) {
  throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* values to frontend/.env.');
}

const configuredAdminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean);

if (configuredAdminEmails.length === 0) {
  throw new Error('No admin emails are configured. Add VITE_ADMIN_EMAILS to frontend/.env.');
}

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function isAllowedAdmin(email: string | null | undefined): boolean {
  return !!email && configuredAdminEmails.includes(email.trim().toLowerCase());
}
