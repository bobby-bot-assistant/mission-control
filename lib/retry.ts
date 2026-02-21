/**
 * Retry helper for operations that may fail with 409 Conflict
 * Useful for agents/crons that want automatic retry on version conflicts
 * 
 * @param fn - Function to execute (should return a promise)
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param delayMs - Delay between retries in milliseconds (default: 100)
 * @returns Result of the function
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 100
): Promise<T> {
  let lastError: Error | undefined
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      // Check if it's a version conflict error (can be either:
      // - VersionConflictError thrown locally
      // - 409 Response from API with "was modified by another process" message)
      const isVersionConflict = 
        (error.name === 'VersionConflictError') ||
        (error.message && error.message.includes('was modified by another process')) ||
        (error.response && error.response.status === 409) ||
        (error.status === 409)
      
      // Only retry on version conflicts
      if (!isVersionConflict || attempt === maxRetries) {
        throw error
      }
      
      console.log(`Version conflict detected, retrying (attempt ${attempt + 1}/${maxRetries + 1})...`)
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)))
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError
}
