import { NextRequest, NextResponse } from 'next/server'
import { readJSON, writeJSON, getFileVersion, VersionConflictError } from '@/lib/data'

const VALID_STATUSES = ['draft', 'editing', 'ready', 'sent', 'archived']
const VALID_FEEDBACK_STATUSES = ['none', 'pending', 'processing', 'done']

/** Validate and normalize a post object before writing to disk */
function validatePost(post: any): { valid: boolean; errors: string[]; normalized: any } {
  const errors: string[] = []
  
  if (!post.id) errors.push('Missing id')
  if (!post.title) errors.push('Missing title')
  if (!post.scheduledDate) errors.push('Missing scheduledDate')
  
  // Ensure platforms object exists with both linkedin and x
  if (!post.platforms) post.platforms = {}
  for (const plat of ['linkedin', 'x'] as const) {
    if (!post.platforms[plat]) {
      post.platforms[plat] = { content: '', status: 'draft' }
    }
    if (!post.platforms[plat].content && post.platforms[plat].content !== '') {
      post.platforms[plat].content = ''
    }
    if (!post.platforms[plat].status || !VALID_STATUSES.includes(post.platforms[plat].status)) {
      post.platforms[plat].status = 'draft'
    }
  }
  
  // Normalize optional fields
  if (!post.tags) post.tags = []
  if (!post.feedbackStatus || !VALID_FEEDBACK_STATUSES.includes(post.feedbackStatus)) {
    post.feedbackStatus = post.feedbackStatus || 'none'
  }
  if (post.archivedAt === undefined) post.archivedAt = null
  if (post.feedback === undefined) post.feedback = null
  
  return { valid: errors.length === 0, errors, normalized: post }
}

async function readData() {
  return readJSON<{ posts: any[], postingGuidelines?: any }>('social-posts.json')
}

async function writeData(data: any, expectedVersion?: string) {
  return writeJSON('social-posts.json', data, expectedVersion)
}

export async function GET() {
  const data = await readData()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const currentVersion = await getFileVersion('social-posts.json')
    const data = await readData()
    if (!data.posts) data.posts = []

    // Support adding a single post or batch of posts
    const newPosts = Array.isArray(body) ? body : [body]

    // Validate required fields and set defaults
    for (const post of newPosts) {
      if (!post.title) {
        return NextResponse.json(
          { error: 'title is required' },
          { status: 400 }
        )
      }
      // Set default scheduledDate if not provided
      if (!post.scheduledDate) {
        post.scheduledDate = new Date().toISOString()
      }
      // Set default platforms if not provided
      if (!post.platforms) {
        post.platforms = {}
      }
    }

    const created = newPosts.map((post: any, idx: number) => {
      const raw = {
        id: post.id || `post-${Date.now()}-${idx}`,
        title: post.title,
        scheduledDate: post.scheduledDate || new Date().toISOString(),
        platforms: post.platforms,
        tags: post.tags || [],
        feedback: post.feedback || null,
        feedbackStatus: post.feedbackStatus || 'none',
        createdAt: post.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archivedAt: null
      }
      const { valid, errors, normalized } = validatePost(raw)
      if (!valid) {
        throw new Error(`Invalid post data: ${errors.join(', ')}`)
      }
      return normalized
    })

    data.posts.push(...created)
    await writeData(data, currentVersion)
    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    if (error instanceof VersionConflictError) {
      return NextResponse.json(
        { error: 'File was modified by another process. Please retry.' },
        { status: 409 }
      )
    }
    console.error('Error creating social post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const currentVersion = await getFileVersion('social-posts.json')
    const data = await readData()

    if (body.action === 'update-post') {
      const idx = data.posts.findIndex((p: any) => p.id === body.id)
      if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      
      // Handle platform-specific updates
      if (body.platform) {
        data.posts[idx].platforms[body.platform] = {
          ...data.posts[idx].platforms[body.platform],
          ...body.updates
        }
      } else {
        data.posts[idx] = { ...data.posts[idx], ...body.updates }
      }
      
      // Validate and normalize before writing
      const { valid, errors, normalized } = validatePost(data.posts[idx])
      if (!valid) {
        return NextResponse.json(
          { error: `Invalid post after update: ${errors.join(', ')}` },
          { status: 400 }
        )
      }
      data.posts[idx] = { ...normalized, updatedAt: new Date().toISOString() }
      await writeData(data, currentVersion)
      return NextResponse.json(data.posts[idx])
    }

    if (body.action === 'update-platform-status') {
      const idx = data.posts.findIndex((p: any) => p.id === body.id)
      if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      
      if (data.posts[idx].platforms && data.posts[idx].platforms[body.platform]) {
        data.posts[idx].platforms[body.platform].status = body.status
        data.posts[idx].updatedAt = new Date().toISOString()
        
        // If marking as sent, auto-archive the whole post after both platforms are sent
        if (body.status === 'sent') {
          const platforms = data.posts[idx].platforms
          const otherPlatform = body.platform === 'linkedin' ? 'x' : 'linkedin'
          if (platforms[otherPlatform]?.status === 'sent') {
            data.posts[idx].archivedAt = new Date().toISOString()
          }
        }
        
        await writeData(data, currentVersion)
        return NextResponse.json(data.posts[idx])
      }
      return NextResponse.json({ error: 'Platform not found' }, { status: 404 })
    }

    if (body.action === 'mark-all-sent') {
      const idx = data.posts.findIndex((p: any) => p.id === body.id)
      if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      
      // Mark both platforms as sent
      if (data.posts[idx].platforms) {
        data.posts[idx].platforms.linkedin.status = 'sent'
        data.posts[idx].platforms.x.status = 'sent'
      }
      data.posts[idx].archivedAt = new Date().toISOString()
      data.posts[idx].updatedAt = new Date().toISOString()
      await writeData(data, currentVersion)
      return NextResponse.json(data.posts[idx])
    }

    if (body.action === 'reorder') {
      for (const item of body.order) {
        const idx = data.posts.findIndex((p: any) => p.id === item.id)
        if (idx !== -1) {
          data.posts[idx].scheduledDate = item.scheduledDate
          data.posts[idx].updatedAt = new Date().toISOString()
        }
      }
      await writeData(data, currentVersion)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
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