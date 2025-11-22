/**
 * Mock declarations for @react-native-firebase/* packages
 * This prevents TypeScript errors and runtime errors when these packages
 * are referenced but not actually used (since we're using web SDK)
 */

declare module '@react-native-firebase/app' {
  const firebase: any;
  export default firebase;
}

declare module '@react-native-firebase/auth' {
  const auth: any;
  export default auth;
}

declare module '@react-native-firebase/firestore' {
  const firestore: any;
  export default firestore;
}

declare module '@react-native-firebase/functions' {
  const functions: any;
  export default functions;
}

declare module '@react-native-firebase/storage' {
  const storage: any;
  export default storage;
}

declare module '@react-native-firebase/messaging' {
  const messaging: any;
  export default messaging;
}

