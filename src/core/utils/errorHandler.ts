/**
 * Centralized error handling utilities
 */

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  context?: string;
  originalError?: any;
  timestamp: Date;
}

export class ErrorHandler {
  /**
   * Create a standardized error object
   */
  static createError(
    error: any,
    context?: string,
    userMessage?: string
  ): AppError {
    return {
      code: this.getErrorCode(error),
      message: this.getErrorMessage(error),
      userMessage: userMessage || this.getUserFriendlyMessage(error),
      context,
      originalError: error,
      timestamp: new Date(),
    };
  }

  /**
   * Get error code from error object
   */
  static getErrorCode(error: any): string {
    if (error?.code) return error.code;
    if (error?.error?.code) return error.error.code;
    if (error?.response?.data?.code) return error.response.data.code;
    return 'UNKNOWN_ERROR';
  }

  /**
   * Get error message from error object
   */
  static getErrorMessage(error: any): string {
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    if (error?.response?.data?.message) return error.response.data.message;
    return 'An unknown error occurred';
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: any): string {
    const code = this.getErrorCode(error);
    const message = this.getErrorMessage(error);

    const userFriendlyMessages: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/weak-password': 'Password is too weak. Please use a stronger password.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'permission-denied': 'You do not have permission to perform this action.',
      'not-found': 'The requested item was not found.',
      'unavailable': 'Service is temporarily unavailable. Please try again later.',
      'deadline-exceeded': 'Request timed out. Please try again.',
      'UNKNOWN_ERROR': 'Something went wrong. Please try again.',
    };

    // Check for exact code match
    if (userFriendlyMessages[code]) {
      return userFriendlyMessages[code];
    }

    // Check for partial matches in message
    for (const [key, value] of Object.entries(userFriendlyMessages)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return userFriendlyMessages['UNKNOWN_ERROR'];
  }

  /**
   * Log error for debugging
   */
  static logError(error: AppError): void {
    if (__DEV__) {
      console.error('[ErrorHandler]', {
        code: error.code,
        message: error.message,
        context: error.context,
        timestamp: error.timestamp,
      });
    }

    // In production, send to error reporting service
    // ErrorReporter.report(error);
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: any): boolean {
    const code = this.getErrorCode(error);
    const nonRetryableCodes = [
      'auth/permission-denied',
      'auth/invalid-argument',
      'auth/not-found',
      'permission-denied',
      'invalid-argument',
      'not-found',
    ];

    return !nonRetryableCodes.includes(code);
  }
}

