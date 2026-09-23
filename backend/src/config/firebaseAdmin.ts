import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set in the environment`);
  return value;
}

function getFirebaseAdminAuth() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: required('FIREBASE_PROJECT_ID'),
        clientEmail: required('FIREBASE_CLIENT_EMAIL'),
        privateKey: required('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n')
      })
    });
  }
  return getAuth();
}

export async function verifyFirebaseIdToken(idToken: string) {
  return getFirebaseAdminAuth().verifyIdToken(idToken);
}

export function isAllowedAdminEmail(email: string | undefined): email is string {
  const allowed = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return !!email && allowed.includes(email.trim().toLowerCase());
}
