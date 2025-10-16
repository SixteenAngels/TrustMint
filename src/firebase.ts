import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAD5LtDxB5tI8EwiyfRB-RdCJOUqGnxD8A",
  authDomain: "trustmint-73687187-f32e6.firebaseapp.com",
  projectId: "trustmint-73687187-f32e6",
  storageBucket: "trustmint-73687187-f32e6.firebasestorage.app",
  messagingSenderId: "657565253063",
  appId: "1:657565253063:web:8dea4de6f0a26ac82c6de2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };