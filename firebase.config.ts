import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "mint-trade-gh.firebaseapp.com",
  projectId: "mint-trade-gh",
  storageBucket: "mint-trade-gh.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize other Firebase services
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { auth, db, storage, functions };
export default app;