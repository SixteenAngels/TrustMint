/**
 * Firebase Configuration - Using Web SDK for Expo compatibility
 * This file exports Firebase services using the web SDK instead of native modules
 */

import { auth, db, storage, functions } from './src/core/firebase';

// Export for backward compatibility
export { auth, db, storage, functions };
export default { auth, db, storage, functions };