// Use compatibility layer for Expo (web SDK)
import { firestore } from '../core/firebase/firestoreAdapter';
import { firebaseAuth } from '../core/firebase/authAdapter';
import { User } from '../types';

const db = firestore();
const auth = firebaseAuth();

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Get current user
  getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser();
    if (!firebaseUser) return null;
    // Convert Firebase user to app User type
      return {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        phone: firebaseUser.phoneNumber || '',
        email: firebaseUser.email || undefined,
        verified: firebaseUser.emailVerified,
        balance: 10000, // Default balance
        createdAt: new Date(),
      };
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: firebaseUser.uid,
          name: data?.name || firebaseUser.displayName || '',
          phone: data?.phone || firebaseUser.phoneNumber || '',
          email: firebaseUser.email || undefined,
          verified: firebaseUser.emailVerified || data?.verified || false,
          balance: data?.balance || 10000,
          createdAt: data?.createdAt?.toDate() || new Date(),
        };
      }
      // Return default user if not in Firestore
      return {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        phone: firebaseUser.phoneNumber || '',
        email: firebaseUser.email || undefined,
        verified: firebaseUser.emailVerified,
        balance: 10000,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Sign up with email and password
  async signUp(email: string, password: string): Promise<User> {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      // Create user profile in Firestore
      const newUser: User = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        phone: firebaseUser.phoneNumber || '',
        email: firebaseUser.email || undefined,
        verified: firebaseUser.emailVerified,
        balance: 10000,
        createdAt: new Date(),
      };
      await db.collection('users').doc(firebaseUser.uid).set(newUser);
      return newUser;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await auth.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Listen for auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }
      // Convert Firebase user to app User type
      const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
      if (userDoc.exists()) {
        const data = userDoc.data();
        callback({
          uid: firebaseUser.uid,
          name: data?.name || firebaseUser.displayName || '',
          phone: data?.phone || firebaseUser.phoneNumber || '',
          email: firebaseUser.email || undefined,
          verified: firebaseUser.emailVerified || data?.verified || false,
          balance: data?.balance || 10000,
          createdAt: data?.createdAt?.toDate() || new Date(),
        });
      } else {
        callback({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          phone: firebaseUser.phoneNumber || '',
          email: firebaseUser.email || undefined,
          verified: firebaseUser.emailVerified,
          balance: 10000,
          createdAt: new Date(),
        });
      }
    });
  }
}
