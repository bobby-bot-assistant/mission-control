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
  return readJSON<{ posts: any[], postingGuidelines?: any }>('social-posts.json')
}

async function writeData(data: any, expectedVersion?: string) {
  return writeJSON('social-posts.json', data, expectedVersion)
}

export async function PATCH(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const patch = await req.json()
    
    // Get current version before read (for optimistic locking)
    const currentVersion = await getFileVersion('social-posts.json')
    
    // Read current data
    const data = await readData()
    if (!data.posts) data.posts = []
    
    // Find the post by id
    const postIndex = data.posts.findIndex((post: any) => post.id === id)
    if (postIndex === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    // Deep merge the patch with the existing post
    const existingPost = data.posts[postIndex]
    const updatedPost = deepMerge(existingPost, patch)
    
    // Update timestamp
    updatedPost.updatedAt = new Date().toISOString()
    
    // Replace the post in the array
    data.posts[postIndex] = updatedPost
    
    // Write back all data with version check
    await writeData(data, currentVersion)
    
    return NextResponse.json(updatedPost)
  } catch (error: any) {
    if (error instanceof VersionConflictError) {
      return NextResponse.json(
        { error: 'File was modified by another process. Please retry.' },
        { status: 409 }
      )
    }
    console.error('Error updating social post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}