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
  return readJSON<{ items: Record<string, any> }>('pipeline-state.json')
}

async function writeData(data: any, expectedVersion?: string) {
  return writeJSON('pipeline-state.json', data, expectedVersion)
}

export async function PATCH(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const patch = await req.json()
    
    // Get current version before read (for optimistic locking)
    const currentVersion = await getFileVersion('pipeline-state.json')
    
    // Read current data
    const data = await readData()
    if (!data.items) data.items = {}
    
    // Check if the pipeline item exists
    if (!(id in data.items)) {
      return NextResponse.json({ error: 'Pipeline item not found' }, { status: 404 })
    }
    
    // Deep merge the patch with the existing item
    const existingItem = data.items[id]
    const updatedItem = deepMerge(existingItem, patch)
    
    // Update timestamp
    updatedItem.lastUpdated = new Date().toISOString()
    
    // Replace the item in the object
    data.items[id] = updatedItem
    
    // Write back all data with version check
    await writeData(data, currentVersion)
    
    return NextResponse.json(updatedItem)
  } catch (error: any) {
    if (error instanceof VersionConflictError) {
      return NextResponse.json(
        { error: 'File was modified by another process. Please retry.' },
        { status: 409 }
      )
    }
    console.error('Error updating pipeline item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}