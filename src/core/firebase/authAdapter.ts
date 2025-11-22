/**
 * Auth Adapter - Provides native-like API using web SDK
 */

import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './index';

/**
 * Auth adapter that mimics @react-native-firebase/auth API
 */
export class AuthAdapter {
  /**
   * Get current user
   */
  currentUser() {
    return auth.currentUser;
  }

  /**
   * Create user with email and password
   */
  async createUserWithEmailAndPassword(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      user: userCredential.user,
    };
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmailAndPassword(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      user: userCredential.user,
    };
  }

  /**
   * Sign out
   */
  async signOut() {
    await firebaseSignOut(auth);
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Update profile
   */
  async updateProfile(user: FirebaseUser, profile: { displayName?: string; photoURL?: string }) {
    await updateProfile(user, profile);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(user: FirebaseUser) {
    await sendEmailVerification(user);
  }
}

// Create singleton instance
const authAdapter = new AuthAdapter();

// Export function that matches @react-native-firebase/auth API
export const firebaseAuth = () => authAdapter;

export default authAdapter;

