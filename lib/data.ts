import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { dataPath, DATA_ROOT } from './config'

/**
 * Shared data layer for Mission Control
 * Provides atomic file operations with backup and error handling
 * Includes version tracking for optimistic locking
 * 
 * SAFETY: All reads/writes are validated to resolve within DATA_ROOT.
 * This prevents agents from accidentally writing to wrong directories.
 */

/**
 * Validate that a resolved path is within DATA_ROOT
 * Throws if path escapes the data directory
 */
function validateDataPath(resolvedPath: string): void {
  const normalizedRoot = path.resolve(DATA_ROOT)
  const normalizedPath = path.resolve(resolvedPath)
  if (!normalizedPath.startsWith(normalizedRoot + path.sep) && normalizedPath !== normalizedRoot) {
    throw new Error(
      `SECURITY: Write path "${normalizedPath}" is outside DATA_ROOT "${normalizedRoot}". ` +
      `All data operations must use the shared data layer (lib/data.ts) with paths relative to DATA_ROOT. ` +
      `Do not construct file paths manually.`
    )
  }
}

// In-memory file locks for atomic version checking
const fileLocks = new Map<string, () => void>()

/**
 * Get the current version hash of a file
 * @param filePath Relative path from data root
 * @returns MD5 hash of file contents, or undefined if file doesn't exist
 */
export async function getFileVersion(filePath: string): Promise<string | undefined> {
  const fullPath = dataPath(filePath)
  
  try {
    const content = await fs.readFile(fullPath, 'utf-8')
    return crypto.createHash('md5').update(content).digest('hex')
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return undefined
    }
    console.error(`Error getting file version for ${fullPath}:`, error)
    throw error
  }
}

/**
 * Acquire a lock for a specific file to ensure atomic read-modify-write
 * @param filePath Relative path from data root
 * @returns Release function to call when done
 */
async function acquireLock(filePath: string): Promise<() => void> {
  const fullPath = dataPath(filePath)
  
  // Wait for any existing lock to be released
  while (fileLocks.has(fullPath)) {
    await new Promise<void>(resolve => setImmediate(resolve))
  }
  
  let released = false
  const release = () => {
    if (!released) {
      released = true
      fileLocks.delete(fullPath)
    }
  }
  
  fileLocks.set(fullPath, release)
  return release
}

/**
 * Read and parse JSON file, returning empty array or object if file doesn't exist
 * @param filePath Relative path from data root
 * @returns Parsed JSON data
 */
export async function readJSON<T>(filePath: string): Promise<T> {
  const fullPath = dataPath(filePath)
  validateDataPath(fullPath)
  
  try {
    const content = await fs.readFile(fullPath, 'utf-8')
    return JSON.parse(content) as T
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist - return appropriate empty structure
      // Try to infer if it should be an array based on filename patterns
      if (filePath.includes('items') || filePath.includes('posts') || filePath.includes('stories') || 
          filePath.includes('roster') || filePath.includes('feedback') || filePath.includes('queue')) {
        return [] as unknown as T
      }
      return {} as unknown as T
    }
    console.error(`Error reading JSON file ${fullPath}:`, error)
    throw error
  }
}

/**
 * Write JSON data to file with backup and atomic operation
 * @param filePath Relative path from data root
 * @param data Data to write (must not be undefined)
 * @param expectedVersion Optional version hash for optimistic locking. If provided and doesn't match current file, throws VersionConflictError
 */
export async function writeJSON<T>(filePath: string, data: T, expectedVersion?: string): Promise<void> {
  if (data === undefined) {
    throw new Error('Cannot write undefined data to JSON file')
  }
  
  const fullPath = dataPath(filePath)
  validateDataPath(fullPath)
  const backupPath = fullPath.replace(/\.json$/, '.backup.json')
  const tempPath = fullPath + '.tmp'
  
  // If expectedVersion is provided, use lock for atomic check-and-write
  if (expectedVersion !== undefined) {
    const releaseLock = await acquireLock(filePath)
    try {
      // Get current version under lock
      const currentVersion = await getFileVersion(filePath)
      
      // If currentVersion is undefined, file doesn't exist yet
      // That's only a conflict if expectedVersion is also not undefined (we expected an existing file)
      if (currentVersion === undefined && expectedVersion !== undefined) {
        throw new VersionConflictError(
          `File ${filePath} was expected to exist but doesn't. Expected version ${expectedVersion}.`
        )
      }
      
      // If file exists, check version matches
      if (currentVersion !== undefined && currentVersion !== expectedVersion) {
        throw new VersionConflictError(
          `File ${filePath} was modified by another process. Expected version ${expectedVersion}, found ${currentVersion}`
        )
      }
      
      // Proceed with write (still under lock)
      await performWrite(fullPath, backupPath, tempPath, data)
    } finally {
      releaseLock()
    }
  } else {
    // Backward compatible: no version check
    await performWrite(fullPath, backupPath, tempPath, data)
  }
}

/**
 * Internal function to perform the actual file write
 */
async function performWrite<T>(fullPath: string, backupPath: string, tempPath: string, data: T): Promise<void> {
  try {
    // Ensure directory exists
    const dir = path.dirname(fullPath)
    await fs.mkdir(dir, { recursive: true })
    
    // Create backup if original file exists
    try {
      await fs.access(fullPath)
      await fs.copyFile(fullPath, backupPath)
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.error(`Warning: Could not create backup for ${fullPath}:`, error)
      }
    }
    
    // Write to temp file first
    const jsonContent = JSON.stringify(data, null, 2)
    await fs.writeFile(tempPath, jsonContent, 'utf-8')
    
    // Atomic rename
    await fs.rename(tempPath, fullPath)
    
  } catch (error: any) {
    console.error(`Error writing JSON file ${fullPath}:`, error)
    
    // Clean up temp file if it exists
    try {
      await fs.unlink(tempPath)
    } catch {
      // Ignore cleanup errors
    }
    
    throw error
  }
}

/**
 * Error thrown when file version doesn't match expected version
 */
export class VersionConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VersionConflictError'
  }
}

/**
 * Convenience function for reading JSON arrays
 * @param filePath Relative path from data root
 * @returns Array data
 */
export async function readJSONArray<T>(filePath: string): Promise<T[]> {
  const data = await readJSON<T[]>(filePath)
  return Array.isArray(data) ? data : []
}