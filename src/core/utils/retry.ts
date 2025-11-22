/**
 * Retry utility with exponential backoff
 */

export interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  delay: 1000,
  exponentialBackoff: true,
  onRetry: () => {},
};

/**
 * Execute a function with retry logic
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on certain errors
      if (shouldNotRetry(error)) {
        throw error;
      }

      if (attempt < config.maxRetries) {
        const delay = config.exponentialBackoff
          ? config.delay * Math.pow(2, attempt)
          : config.delay;

        config.onRetry(attempt + 1, error);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Determine if error should not be retried
 */
function shouldNotRetry(error: any): boolean {
  const noRetryCodes = [
    'auth/permission-denied',
    'auth/invalid-argument',
    'auth/not-found',
    'permission-denied',
    'invalid-argument',
  ];

  return noRetryCodes.some(
    code => error?.code === code || error?.message?.includes(code)
  );
}

