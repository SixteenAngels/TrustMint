import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAD5LtDxB5tI8EwiyfRB-RdCJOUqGnxD8A",
  authDomain: "trustmint-73687187-f32e6.firebaseapp.com",
  projectId: "trustmint-73687187-f32e6",
  storageBucket: "trustmint-73687187-f32e6.firebasestorage.app",
  messagingSenderId: "657565253063",
  appId: "1:657565253063:web:8dea4de6f0a26ac82c6de2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize other Firebase services
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { auth, db, storage, functions };
export default app;