/**
 * Base Service for Firebase-based services
 * Provides common functionality: error handling, retry logic, logging, and singleton pattern
 */

export interface RetryConfig {
  maxRetries: number;
  delay: number;
  exponentialBackoff: boolean;
}

export interface ServiceError {
  code: string;
  message: string;
  context?: string;
  originalError?: any;
}

export abstract class BaseFirebaseService {
  protected static instances: Map<string, BaseFirebaseService> = new Map();
  protected readonly serviceName: string;
  protected readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    delay: 1000,
    exponentialBackoff: true,
  };

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Execute a function with retry logic
   */
  protected async executeWithRetry<T>(
    fn: () => Promise<T>,
    context: string,
    config?: Partial<RetryConfig>
  ): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: any;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          throw this.handleError(error, context);
        }

        if (attempt < retryConfig.maxRetries) {
          const delay = retryConfig.exponentialBackoff
            ? retryConfig.delay * Math.pow(2, attempt)
            : retryConfig.delay;
          
          this.log(`Retrying ${context} (attempt ${attempt + 1}/${retryConfig.maxRetries}) after ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    throw this.handleError(lastError, context);
  }

  /**
   * Handle errors consistently across all services
   */
  protected handleError(error: any, context: string): ServiceError {
    const errorCode = this.getErrorCode(error);
    const errorMessage = this.getErrorMessage(error, context);
    
    const serviceError: ServiceError = {
      code: errorCode,
      message: errorMessage,
      context: `${this.serviceName}.${context}`,
      originalError: error,
    };

    this.logError(serviceError);
    return serviceError;
  }

  /**
   * Convert Firestore timestamp to Date
   */
  protected toDate(timestamp: any): Date | undefined {
    if (!timestamp) return undefined;
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp?.toDate === 'function') {
      return timestamp.toDate();
    }
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    return undefined;
  }

  /**
   * Convert Firestore timestamp to Date with fallback
   */
  protected toDateOrNow(timestamp: any): Date {
    return this.toDate(timestamp) || new Date();
  }

  /**
   * Safely get data from Firestore document
   */
  protected getDocumentData<T>(doc: any): T | null {
    if (!doc || !doc.exists()) return null;
    const data = doc.data();
    return data ? { ...data, id: doc.id } as T : null;
  }

  /**
   * Safely map Firestore documents
   */
  protected mapDocuments<T>(docs: any[], transformer?: (data: any) => T): T[] {
    return docs
      .map((doc: any) => {
        const data = doc.data();
        if (!data) return null;
        const transformed = transformer 
          ? transformer({ ...data, id: doc.id })
          : { ...data, id: doc.id };
        return transformed as T;
      })
      .filter((item): item is T => item !== null);
  }

  /**
   * Log information
   */
  protected log(message: string, data?: any): void {
    if (__DEV__) {
      console.log(`[${this.serviceName}] ${message}`, data || '');
    }
  }

  /**
   * Log errors
   */
  protected logError(error: ServiceError): void {
    console.error(`[${this.serviceName}] Error:`, {
      code: error.code,
      message: error.message,
      context: error.context,
    });
    
    // In production, send to error reporting service
    if (!__DEV__ && error.originalError) {
      // ErrorReporter.report(error.originalError, error.context);
    }
  }

  /**
   * Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Determine if error should not be retried
   */
  private shouldNotRetry(error: any): boolean {
    // Don't retry authentication errors, validation errors, etc.
    const noRetryCodes = [
      'auth/permission-denied',
      'auth/invalid-argument',
      'auth/not-found',
      'permission-denied',
      'invalid-argument',
    ];
    
    return noRetryCodes.some(code => 
      error?.code === code || 
      error?.message?.includes(code)
    );
  }

  /**
   * Extract error code from error object
   */
  private getErrorCode(error: any): string {
    if (error?.code) return error.code;
    if (error?.error?.code) return error.error.code;
    return 'UNKNOWN_ERROR';
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any, context: string): string {
    // Firebase error messages
    if (error?.message) {
      return this.formatFirebaseError(error.message);
    }
    
    // Generic error
    return `Failed to ${context.replace(/([A-Z])/g, ' $1').toLowerCase()}. Please try again.`;
  }

  /**
   * Format Firebase error messages to be user-friendly
   */
  private formatFirebaseError(message: string): string {
    const errorMap: Record<string, string> = {
      'permission-denied': 'You do not have permission to perform this action.',
      'not-found': 'The requested resource was not found.',
      'already-exists': 'This resource already exists.',
      'unavailable': 'Service is temporarily unavailable. Please try again later.',
      'deadline-exceeded': 'Request timed out. Please try again.',
      'resource-exhausted': 'Too many requests. Please try again later.',
      'failed-precondition': 'Operation cannot be completed at this time.',
      'aborted': 'Operation was cancelled.',
      'out-of-range': 'Invalid input provided.',
      'unimplemented': 'This feature is not yet available.',
      'internal': 'An internal error occurred. Please try again.',
      'unauthenticated': 'Please sign in to continue.',
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (message.toLowerCase().includes(key)) {
        return value;
      }
    }

    return message;
  }

  /**
   * Get singleton instance
   */
  protected static getInstance<T extends BaseFirebaseService>(
    this: new (...args: any[]) => T,
    key: string = 'default',
    ...args: any[]
  ): T {
    const instanceKey = `${this.name}-${key}`;
    
    if (!BaseFirebaseService.instances.has(instanceKey)) {
      BaseFirebaseService.instances.set(
        instanceKey,
        new this(...args)
      );
    }
    
    return BaseFirebaseService.instances.get(instanceKey) as T;
  }
}

