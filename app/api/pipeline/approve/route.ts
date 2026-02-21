import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { dataPath } from '@/lib/config'
import { readJSON, writeJSON } from '@/lib/data'

const QUEUE_PATH = dataPath('pipeline/prd-queue.json')
const BRIEFS_DIR = dataPath('pipeline/briefs')

export async function POST(req: NextRequest) {
  try {
    const { briefId, status } = await req.json()

    // Accept either just briefId, or briefId with status: "approved"
    if (!briefId) {
      return NextResponse.json(
        { error: 'briefId is required' },
        { status: 400 }
      )
    }

    // If status is provided, it must be "approved"
    if (status && status !== 'approved') {
      return NextResponse.json(
        { error: 'status must be "approved"' },
        { status: 400 }
      )
    }

    // Update brief status
    const briefFile = path.join(BRIEFS_DIR, `${briefId}.json`)
    try {
      await fs.access(briefFile)
      const content = await fs.readFile(briefFile, 'utf-8')
      const brief = JSON.parse(content)
      brief.status = 'approved'
      brief.updatedAt = new Date().toISOString()
      await fs.writeFile(briefFile, JSON.stringify(brief, null, 2))
    } catch {
      // Brief file doesn't exist - continue
    }

    // Read or create prd-queue
    let queue: any[] = []
    try {
      queue = await readJSON<any[]>(QUEUE_PATH)
    } catch { /* start fresh */ }

    // Don't duplicate
    if (queue.some((item: any) => item.briefId === briefId)) {
      return NextResponse.json({ success: true, message: 'Already queued' })
    }

    queue.push({
      id: `prd-${Date.now()}`,
      briefId,
      status: 'queued',
      requestedAt: new Date().toISOString(),
      stages: {
        research: 'pending',
        clinical: 'pending',
        positioning: 'pending',
        synthesis: 'pending'
      }
    })

    await writeJSON(QUEUE_PATH, queue)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error approving brief:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
