/**
 * Firebase initialization entry point
 * This file ensures Firebase is initialized BEFORE any other code tries to use it
 * Import this at the very top of your entry point (index.ts)
 */

// Initialize Firebase immediately when this module is imported
import './core/firebase';

// Re-export everything for convenience
export { firebaseConfig, app, db, auth, storage, functions } from './core/firebase';
