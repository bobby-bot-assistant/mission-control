import { NextRequest, NextResponse } from 'next/server'
import { readJSON, writeJSON } from '@/lib/data'

export const dynamic = 'force-dynamic'

const STORIES_FILE = 'stories.json'

export async function GET() {
  try {
    const stories = await readJSON<any[]>(STORIES_FILE)
    return NextResponse.json(stories)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, updates } = await req.json()
    const stories = await readJSON<any[]>(STORIES_FILE)
    const idx = stories.findIndex((s: any) => s.id === id)
    if (idx === -1) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }
    stories[idx] = { ...stories[idx], ...updates }
    await writeJSON(STORIES_FILE, stories)
    return NextResponse.json(stories[idx])
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
