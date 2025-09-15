/**
 * Async utility functions for handling promises and error management
 */

/**
 * Success result type for Result pattern
 */
type Success<T> = {
  data: T;
  error: null;
  success: true;
};

/**
 * Failure result type for Result pattern
 */
type Failure<E> = {
  data: null;
  error: E;
  success: false;
};

/**
 * Result type that represents either success or failure
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Wraps a promise in a try-catch and returns a Result type instead of throwing.
 * This follows the Result pattern for better error handling without try-catch blocks.
 *
 * @param promise - The promise to execute safely
 * @returns Promise that resolves to either Success or Failure result
 *
 * @example
 * const result = await tryCatch(fetch('/api/users'));
 * if (result.success) {
 *   console.log('Data:', result.data);
 * } else {
 *   console.error('Error:', result.error);
 * }
 */
export async function tryCatch<T, E = Error>(
  promise: Promise<T>
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null, success: true };
  } catch (error) {
    return { data: null, error: error as E, success: false };
  }
}

/**
 * Synchronous version of tryCatch for functions that might throw
 *
 * @param fn - Function that might throw an error
 * @returns Result type with either success or failure
 *
 * @example
 * const result = tryCatchSync(() => JSON.parse(jsonString));
 * if (result.success) {
 *   console.log('Parsed:', result.data);
 * } else {
 *   console.error('Parse error:', result.error);
 * }
 */
export function tryCatchSync<T, E = Error>(fn: () => T): Result<T, E> {
  try {
    const data = fn();
    return { data, error: null, success: true };
  } catch (error) {
    return { data: null, error: error as E, success: false };
  }
}

/**
 * Delays execution for a specified number of milliseconds
 *
 * @param ms - Number of milliseconds to delay
 * @returns Promise that resolves after the delay
 *
 * @example
 * await delay(1000); // Wait 1 second
 * console.log('This runs after 1 second');
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Creates a promise that rejects after a timeout
 *
 * @param ms - Number of milliseconds before timeout
 * @param message - Optional timeout message
 * @returns Promise that rejects with timeout error
 */
export const timeout = (ms: number, message?: string): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message || `Operation timed out after ${ms}ms`));
    }, ms);
  });
};

/**
 * Races a promise against a timeout
 *
 * @param promise - The promise to race
 * @param ms - Timeout in milliseconds
 * @param timeoutMessage - Optional timeout error message
 * @returns Promise that resolves with the original promise or rejects with timeout
 *
 * @example
 * const result = await withTimeout(fetch('/api/data'), 5000);
 * // Will either return fetch result or timeout after 5 seconds
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutMessage?: string
): Promise<T> {
  return Promise.race([promise, timeout(ms, timeoutMessage)]);
}

/**
 * Retries a promise-returning function with exponential backoff
 *
 * @param fn - Function that returns a promise
 * @param options - Retry configuration
 * @param options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param options.baseDelay - Base delay in milliseconds (default: 1000)
 * @param options.maxDelay - Maximum delay in milliseconds (default: 10000)
 * @param options.backoffFactor - Exponential backoff multiplier (default: 2)
 * @param options.shouldRetry - Function to determine if error should trigger retry
 * @returns Promise that resolves with successful result or rejects with final error
 *
 * @example
 * const result = await retry(
 *   () => fetch('/api/data'),
 *   { maxRetries: 3, baseDelay: 1000 }
 * );
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on last attempt or if shouldRetry returns false
      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delayTime = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      );

      await delay(delayTime);
    }
  }

  throw lastError!;
}

/**
 * Executes promises in parallel with a concurrency limit
 *
 * @param items - Array of items to process
 * @param fn - Function that processes each item and returns a promise
 * @param concurrency - Maximum number of concurrent executions (default: 5)
 * @returns Promise that resolves with array of results
 *
 * @example
 * const urls = ['url1', 'url2', 'url3', ...];
 * const results = await parallelLimit(
 *   urls,
 *   url => fetch(url),
 *   3 // Process max 3 URLs at once
 * );
 */
export async function parallelLimit<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number = 5
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  const semaphore = new Array(concurrency).fill(null);
  let index = 0;

  const worker = async (): Promise<void> => {
    while (index < items.length) {
      const currentIndex = index++;
      const item = items[currentIndex];
      results[currentIndex] = await fn(item, currentIndex);
    }
  };

  await Promise.all(semaphore.map(() => worker()));
  return results;
}

/**
 * Type guard to check if a Result is successful
 *
 * @param result - Result to check
 * @returns True if result is successful
 */
export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> => {
  return result.success === true;
};

/**
 * Type guard to check if a Result is a failure
 *
 * @param result - Result to check
 * @returns True if result is a failure
 */
export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> => {
  return result.success === false;
};
