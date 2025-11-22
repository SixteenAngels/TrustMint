/**
 * Error codes and messages
 */

export const ERROR_CODES = {
  // Authentication errors
  AUTH_USER_NOT_FOUND: 'auth/user-not-found',
  AUTH_WRONG_PASSWORD: 'auth/wrong-password',
  AUTH_EMAIL_IN_USE: 'auth/email-already-in-use',
  AUTH_WEAK_PASSWORD: 'auth/weak-password',
  AUTH_INVALID_EMAIL: 'auth/invalid-email',
  AUTH_NETWORK_ERROR: 'auth/network-request-failed',
  AUTH_TOO_MANY_REQUESTS: 'auth/too-many-requests',
  
  // Firestore errors
  PERMISSION_DENIED: 'permission-denied',
  NOT_FOUND: 'not-found',
  UNAVAILABLE: 'unavailable',
  DEADLINE_EXCEEDED: 'deadline-exceeded',
  RESOURCE_EXHAUSTED: 'resource-exhausted',
  
  // App errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
} as const;

export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 'No account found with this email.',
  [ERROR_CODES.AUTH_WRONG_PASSWORD]: 'Incorrect password. Please try again.',
  [ERROR_CODES.AUTH_EMAIL_IN_USE]: 'This email is already registered.',
  [ERROR_CODES.AUTH_WEAK_PASSWORD]: 'Password is too weak. Please use a stronger password.',
  [ERROR_CODES.AUTH_INVALID_EMAIL]: 'Please enter a valid email address.',
  [ERROR_CODES.AUTH_NETWORK_ERROR]: 'Network error. Please check your connection.',
  [ERROR_CODES.AUTH_TOO_MANY_REQUESTS]: 'Too many attempts. Please try again later.',
  [ERROR_CODES.PERMISSION_DENIED]: 'You do not have permission to perform this action.',
  [ERROR_CODES.NOT_FOUND]: 'The requested item was not found.',
  [ERROR_CODES.UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
  [ERROR_CODES.DEADLINE_EXCEEDED]: 'Request timed out. Please try again.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Something went wrong. Please try again.',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_CODES.INSUFFICIENT_BALANCE]: 'Insufficient balance to complete this transaction.',
  [ERROR_CODES.INVALID_AMOUNT]: 'Please enter a valid amount.',
};

