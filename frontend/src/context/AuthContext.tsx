import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { api, tokenStore } from '../api/client';
import { firebaseAuth, googleProvider, isAllowedAdmin } from '../config/firebase';

interface AuthContextValue {
  isAuthenticated: boolean;
  isChecking: boolean;
  userId: string | null;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const finishFirebaseLogin = useCallback(async (email: string, idToken: string) => {
    if (!isAllowedAdmin(email)) {
      tokenStore.clear();
      throw new Error('Access denied. This Google account is not an admin account.');
    }
    const res = await api.post('/auth/firebase', { idToken });
    // Use the Firebase ID token for every protected API request. The backend
    // verifies it again with Firebase Admin on every request.
    tokenStore.set(idToken);
    setUserId(res.data.userId);
  }, []);

  // Restore a Firebase session after a refresh, then exchange its ID token for the API JWT.
  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user?.email || !isAllowedAdmin(user.email)) {
        tokenStore.clear();
        setUserId(null);
        if (user) await signOut(firebaseAuth);
        setIsChecking(false);
        return;
      }
      try {
        await finishFirebaseLogin(user.email, await user.getIdToken());
      } catch {
        tokenStore.clear();
        setUserId(null);
        await signOut(firebaseAuth);
      } finally {
        setIsChecking(false);
      }
    });
  }, [finishFirebaseLogin]);

  const login = useCallback(async () => {
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    const email = result.user.email;
    if (!isAllowedAdmin(email)) {
      await signOut(firebaseAuth);
      throw new Error('Access denied. Only authorised admin email accounts can sign in.');
    }
    await finishFirebaseLogin(email!, await result.user.getIdToken());
  }, [finishFirebaseLogin]);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUserId(null);
    void signOut(firebaseAuth);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!userId, isChecking, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
