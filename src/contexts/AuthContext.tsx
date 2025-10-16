import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  PhoneAuthProvider,
  signInWithCredential,
  linkWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  ApplicationVerifier,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase.config';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID, API_BASE_URL } from '../config';
import { signInWithCustomToken } from 'firebase/auth';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  startPhoneVerification: (phoneNumber: string, appVerifier: ApplicationVerifier) => Promise<string>;
  verifyOTP: (verificationId: string, otp: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ ...userDoc.data(), uid: firebaseUser.uid } as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUpWithEmail = async (email: string, password: string, name?: string): Promise<void> => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
  };

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const startPhoneVerification = async (phoneNumber: string, appVerifier: ApplicationVerifier): Promise<string> => {
    const provider = new PhoneAuthProvider(auth);
    const verificationId = await provider.verifyPhoneNumber(phoneNumber, appVerifier);
    return verificationId;
  };

  const verifyOTP = async (verificationId: string, otp: string): Promise<void> => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);

      if (auth.currentUser) {
        const linkedResult = await linkWithCredential(auth.currentUser, credential);
        const userRef = doc(db, 'users', linkedResult.user.uid);
        await setDoc(userRef, { phone: linkedResult.user.phoneNumber || '', verified: true }, { merge: true });
        setUser((prev) => (prev ? { ...prev, phone: linkedResult.user.phoneNumber || '', verified: true } : prev));
      } else {
        const result = await signInWithCredential(auth, credential);
        const userRef = doc(db, 'users', result.user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          const newUser: User = {
            uid: result.user.uid,
            name: '',
            phone: result.user.phoneNumber || '',
            verified: true,
            balance: 10000,
            createdAt: new Date(),
          };
          await setDoc(userRef, newUser);
          setUser(newUser);
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    WebBrowser.maybeCompleteAuthSession();
    const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
    const redirectUri = AuthSession.makeRedirectUri({});
    const authRequest = new AuthSession.AuthRequest({
      clientId: Platform.OS === 'android' ? GOOGLE_ANDROID_CLIENT_ID : GOOGLE_CLIENT_ID,
      redirectUri,
      responseType: AuthSession.ResponseType.IdToken,
      scopes: ['openid', 'profile', 'email'],
    });
    const result = await authRequest.promptAsync(discovery as any);
    if (result.type !== 'success' || !result.params.id_token) throw new Error('Google sign-in canceled');
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: result.params.id_token }),
    });
    if (!res.ok) throw new Error('Google sign-in failed');
    const { customToken } = await res.json();
    await signInWithCustomToken(auth, customToken);
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { ...user, ...userData }, { merge: true });
      setUser({ ...user, ...userData });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUpWithEmail,
    signInWithEmail,
    startPhoneVerification,
    verifyOTP,
    signInWithGoogle,
    signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};