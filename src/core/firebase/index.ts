/**
 * Platform-aware Firebase initialization
 * Uses web SDK for Expo (works in managed workflow)
 * 
 * IMPORTANT: This file must be imported FIRST before any other Firebase imports
 * to ensure AsyncStorage persistence is set up correctly.
 */

// Note: Native Firebase modules are mocked in src/types/firebase-native-mock.d.ts
// to prevent TypeScript errors. Runtime errors are prevented by using web SDK.

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAD5LtDxB5tI8EwiyfRB-RdCJOUqGnxD8A",
  authDomain: "trustmint-73687187-f32e6.firebaseapp.com",
  projectId: "trustmint-73687187-f32e6",
  storageBucket: "trustmint-73687187-f32e6.firebasestorage.app",
  messagingSenderId: "657565253063",
  appId: "1:657565253063:web:8dea4de6f0a26ac82c6de2"
};

// Use web SDK (works in Expo)
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Auth with AsyncStorage persistence
// This ensures auth state persists between app sessions
// Use a singleton pattern to prevent multiple initializations

let auth: any;
let authInitialized = false;

if (!authInitialized) {
  try {
    // Ensure app is initialized first
    if (!app) {
      throw new Error('Firebase App must be initialized before Auth');
    }

    // Always try initializeAuth first with AsyncStorage persistence
    // This is the recommended approach for React Native
    if (getReactNativePersistence && typeof getReactNativePersistence === 'function') {
      try {
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage)
        });
        authInitialized = true;
        if (__DEV__) {
          console.log('[Firebase] Auth initialized with AsyncStorage persistence');
        }
      } catch (initError: any) {
        // If auth is already initialized, get the existing instance
        if (initError.code === 'auth/already-initialized' || 
            initError.message?.includes('already-initialized') ||
            initError.message?.includes('already initialized')) {
          auth = getAuth(app);
          authInitialized = true;
          if (__DEV__) {
            console.log('[Firebase] Auth already initialized, using existing instance');
          }
        } else {
          // For other errors, still try to get existing auth
          auth = getAuth(app);
          authInitialized = true;
          if (__DEV__) {
            console.warn('[Firebase] initializeAuth failed, using getAuth. Error:', initError.message);
          }
        }
      }
    } else {
      // Fallback if getReactNativePersistence not available
      auth = getAuth(app);
      authInitialized = true;
      if (__DEV__) {
        console.warn('[Firebase] getReactNativePersistence not available, using getAuth');
      }
    }
    
    // Verify auth is properly configured
    if (!auth) {
      throw new Error('Failed to get Auth instance');
    }
    
    // Verify the auth instance has the app reference
    if (!auth.app || auth.app.name !== app.name) {
      throw new Error('Auth instance is not properly linked to app');
    }
    
    authInitialized = true;
    
    if (__DEV__) {
      console.log('[Firebase] Auth initialized successfully with app:', app.name);
    }
  } catch (e: any) {
    console.error('[Firebase] Auth initialization error:', e);
    // Last resort: try getAuth
    try {
      auth = getAuth(app);
      authInitialized = true;
      if (__DEV__) {
        console.error('[Firebase] Fallback to getAuth after error:', e.message);
      }
    } catch (finalError) {
      console.error('[Firebase] Final fallback failed:', finalError);
      throw new Error('Failed to initialize Firebase Auth');
    }
  }
} else {
  // Auth already initialized, just get the existing instance
  auth = getAuth(app);
}

// Final verification
if (!auth) {
  const error = new Error('Failed to initialize Firebase Auth. Check your Firebase configuration and ensure the app is initialized first.');
  console.error('[Firebase]', error.message);
  throw error;
}

// Verify auth configuration
if (!auth.app || !auth.app.options || !auth.app.options.apiKey) {
  const error = new Error('Firebase Auth configuration is incomplete. Check firebaseConfig.');
  console.error('[Firebase]', error.message);
  throw error;
}

// Initialize Firebase services
export const db = getFirestore(app);
export { auth };
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Export for compatibility
export { app };

// Helper to check if we're using native modules
export const isUsingNativeFirebase = false; // Expo uses web SDK


