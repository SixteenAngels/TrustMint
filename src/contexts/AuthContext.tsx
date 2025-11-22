import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { GOOGLE_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID, APP_SCHEME } from '../config';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInAsAdmin: (email: string, password: string) => Promise<void>;
  signInAsManager: (email: string, password: string) => Promise<void>;
  startPhoneVerification: (phoneNumber: string, appVerifier: ApplicationVerifier) => Promise<string>;
  verifyOTP: (verificationId: string, otp: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  bypassAuth: () => void;
  bypassAdminAuth: () => void;
  bypassManagerAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null,
  loading: true,
  signUpWithEmail: async () => {},
  signInWithEmail: async () => {},
  signInAsAdmin: async () => {},
  signInAsManager: async () => {},
  startPhoneVerification: async () => '',
  verifyOTP: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateUser: async () => {},
  bypassAuth: () => {},
  bypassAdminAuth: () => {},
  bypassManagerAuth: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize Google OAuth discovery at component level (hook usage)
  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          const newUser: User = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || '',
            phone: firebaseUser.phoneNumber || '',
            verified: false,
            balance: 10000,
            createdAt: new Date(),
          };
          await setDoc(userRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signUpWithEmail = async (email: string, password: string, name?: string): Promise<void> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
      // Create user document in Firestore immediately
      const userRef = doc(db, 'users', cred.user.uid);
      const newUser: User = {
        uid: cred.user.uid,
        name: name || cred.user.displayName || '',
        email: cred.user.email || undefined,
        phone: cred.user.phoneNumber || '',
        verified: false,
        balance: 10000,
        createdAt: new Date(),
      };
      await setDoc(userRef, newUser);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to sign up. Please try again.');
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  const signInAsAdmin = async (email: string, password: string): Promise<void> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, 'users', cred.user.uid);
      const userDoc = await getDoc(userRef);
      
      // Check if user is admin (you can customize this logic)
      const isAdmin = userDoc.exists() && (userDoc.data()?.role === 'admin' || userDoc.data()?.isAdmin === true);
      
      // Also check a hardcoded admin list for development
      const adminEmails = ['admin@minttrade.com', 'admin@trustmint.com'];
      const isHardcodedAdmin = adminEmails.includes(email.toLowerCase());
      
      if (!isAdmin && !isHardcodedAdmin) {
        await firebaseSignOut(auth);
        throw new Error('Access denied. Admin privileges required.');
      }
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        // Ensure admin role is set
        if (!userData.role && !userData.isAdmin) {
          await setDoc(userRef, { ...userData, role: 'admin', isAdmin: true }, { merge: true });
          setUser({ ...userData, role: 'admin', isAdmin: true } as User);
        } else {
          setUser(userData);
        }
      } else {
        const newAdminUser: User = {
          uid: cred.user.uid,
          name: cred.user.displayName || 'Admin',
          email: cred.user.email || undefined,
          phone: cred.user.phoneNumber || '',
          verified: cred.user.emailVerified,
          balance: 0,
          createdAt: new Date(),
          role: 'admin',
          isAdmin: true,
        };
        await setDoc(userRef, newAdminUser);
        setUser(newAdminUser);
      }
    } catch (error: any) {
      console.error('Error signing in as admin:', error);
      throw new Error(error.message || 'Failed to sign in as admin. Please check your credentials.');
    }
  };

  const signInAsManager = async (email: string, password: string): Promise<void> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, 'users', cred.user.uid);
      const userDoc = await getDoc(userRef);
      
      // Check if user is manager
      const isManager = userDoc.exists() && (userDoc.data()?.role === 'manager' || userDoc.data()?.isManager === true);
      
      // Also check a hardcoded manager list for development
      const managerEmails = ['manager@minttrade.com', 'manager@trustmint.com'];
      const isHardcodedManager = managerEmails.includes(email.toLowerCase());
      
      if (!isManager && !isHardcodedManager) {
        await firebaseSignOut(auth);
        throw new Error('Access denied. Manager privileges required.');
      }
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        // Ensure manager role is set
        if (!userData.role && !userData.isManager) {
          await setDoc(userRef, { ...userData, role: 'manager', isManager: true }, { merge: true });
          setUser({ ...userData, role: 'manager', isManager: true } as User);
        } else {
          setUser(userData);
        }
      } else {
        const newManagerUser: User = {
          uid: cred.user.uid,
          name: cred.user.displayName || 'Manager',
          email: cred.user.email || undefined,
          phone: cred.user.phoneNumber || '',
          verified: cred.user.emailVerified,
          balance: 0,
          createdAt: new Date(),
          role: 'manager',
          isManager: true,
        };
        await setDoc(userRef, newManagerUser);
        setUser(newManagerUser);
      }
    } catch (error: any) {
      console.error('Error signing in as manager:', error);
      throw new Error(error.message || 'Failed to sign in as manager. Please check your credentials.');
    }
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
        setUser((prev: User | null) => (prev ? { ...prev, phone: linkedResult.user.phoneNumber || '', verified: true } : prev));
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
    try {
      WebBrowser.maybeCompleteAuthSession();

      const isExpoGo = Constants.appOwnership === 'expo';
      const useProxy = isExpoGo || Platform.OS === 'web';
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: isExpoGo ? undefined : APP_SCHEME,
        useProxy,
        path: 'auth-callback',
      });

      const randomBytes = await Crypto.getRandomBytesAsync(16);
      const nonce = Array.from(randomBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
      const state = Math.random().toString(36).substring(2);

      const queryParams = new URLSearchParams({
        client_id: Platform.OS === 'android' ? GOOGLE_ANDROID_CLIENT_ID : GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'id_token',
        scope: 'openid profile email',
        prompt: 'select_account',
        nonce,
        state,
      });

      const authUrl = `${(discovery?.authorizationEndpoint) || 'https://accounts.google.com/o/oauth2/v2/auth'}?${queryParams.toString()}`;
      const result = await AuthSession.startAsync({
        authUrl,
        returnUrl: redirectUri,
      });

      if (result.type !== 'success' || !result.params?.id_token) {
        throw new Error('Google sign-in canceled');
      }

      const credential = GoogleAuthProvider.credential(result.params.id_token as string);
      const firebaseResult = await signInWithCredential(auth, credential);
      const firebaseUser = firebaseResult.user;

      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        const newUser: User = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || undefined,
          phone: firebaseUser.phoneNumber || '',
          verified: true,
          balance: 10000,
          createdAt: new Date(),
        };
        await setDoc(userRef, newUser);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
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
    signInAsAdmin,
    signInAsManager,
    startPhoneVerification,
    verifyOTP,
    signInWithGoogle,
    signOut,
    updateUser,
    bypassAuth: () => {
      const mockUser: User = {
        uid: 'bypass-user',
        id: 'bypass-user',
        name: 'Guest User',
        phone: '',
        email: undefined,
        verified: false,
        balance: 10000,
        createdAt: new Date(),
      };
      setUser(mockUser);
    },
    bypassAdminAuth: () => {
      const mockAdminUser: User = {
        uid: 'bypass-admin-user',
        id: 'bypass-admin-user',
        name: 'Admin User',
        phone: '',
        email: 'admin@minttrade.com',
        verified: true,
        balance: 0,
        createdAt: new Date(),
        role: 'admin',
        isAdmin: true,
      };
      setUser(mockAdminUser);
    },
    bypassManagerAuth: () => {
      const mockManagerUser: User = {
        uid: 'bypass-manager-user',
        id: 'bypass-manager-user',
        name: 'Manager User',
        phone: '',
        email: 'manager@minttrade.com',
        verified: true,
        balance: 0,
        createdAt: new Date(),
        role: 'manager',
        isManager: true,
      };
      setUser(mockManagerUser);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
