/**
 * Firebase Compatibility Layer
 * Provides @react-native-firebase-like API using web SDK
 * Use this instead of @react-native-firebase/* imports in Expo
 */

import { firestore } from './firestoreAdapter';
import { functions } from './functionsAdapter';
import { firebaseAuth } from './authAdapter';

// Export as default firebase object (like @react-native-firebase/app)
const firebase = {
  firestore: () => firestore(),
  functions: () => functions(),
  auth: () => firebaseAuth(),
};

export default firebase;

// Named exports for direct use
export { firestore, functions, firebaseAuth as auth };

