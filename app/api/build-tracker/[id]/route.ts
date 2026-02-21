import { NextRequest, NextResponse } from 'next/server'
import { readJSON, writeJSON, getFileVersion, VersionConflictError } from '@/lib/data'

/**
 * Deep merge utility function
 * Recursively merges objects, preserving nested structure
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  if (source === null || source === undefined) return target
  if (typeof source !== 'object' || typeof target !== 'object') return source as T
  
  const result = { ...target }
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key]
      const targetValue = (target as any)[key]
      
      if (sourceValue !== null && sourceValue !== undefined) {
        if (typeof sourceValue === 'object' && !Array.isArray(sourceValue) && 
            targetValue !== null && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
          ;(result as any)[key] = deepMerge(targetValue, sourceValue)
        } else {
          ;(result as any)[key] = sourceValue
        }
      }
    }
  }
  
  return result
}

async function readData() {
  return readJSON<{ sprints: any[], tasks: any[] }>('build-tracker.json')
}

async function writeData(data: any, expectedVersion?: string) {
  return writeJSON('build-tracker.json', data, expectedVersion)
}

export async function PATCH(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const patch = await req.json()
    
    // Get current version before read (for optimistic locking)
    const currentVersion = await getFileVersion('build-tracker.json')
    
    // Read current data
    const data = await readData()
    if (!data.tasks) data.tasks = []
    
    // Find the task by id in the tasks array
    const taskIndex = data.tasks.findIndex((task: any) => task.id === id)
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    // Deep merge the patch with the existing task
    const existingTask = data.tasks[taskIndex]
    const updatedTask = deepMerge(existingTask, patch)
    
    // Update timestamp - using same field pattern as other endpoints
    updatedTask.lastUpdated = new Date().toISOString()
    
    // Replace the task in the array
    data.tasks[taskIndex] = updatedTask
    
    // Write back all data (sprints + tasks) with version check
    await writeData(data, currentVersion)
    
    return NextResponse.json(updatedTask)
  } catch (error: any) {
    if (error instanceof VersionConflictError) {
      return NextResponse.json(
        { error: 'File was modified by another process. Please retry.' },
        { status: 409 }
      )
    }
    console.error('Error updating build tracker task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}