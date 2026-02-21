import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

const DATA_ROOT = '/Users/daisydukes/openclaw-projects/mission-control-data'
const BRIEFS_FILE = path.join(DATA_ROOT, 'research-briefs.json')

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const raw = await fs.readFile(BRIEFS_FILE, 'utf-8')
    const data = JSON.parse(raw)

    const brief = data.briefs.find((b: any) => b.id === id)
    if (!brief) {
      return NextResponse.json({ error: 'brief not found' }, { status: 404 })
    }

    // Resolve the path (handle ~ expansion)
    const filePath = brief.path.replace(/^~/, '/Users/daisydukes')
    
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return NextResponse.json({ id, content, title: brief.title, agent: brief.agent })
    } catch {
      return NextResponse.json({ error: 'brief file not found at ' + filePath }, { status: 404 })
    }
  } catch (err) {
    console.error('Failed to read brief content:', err)
    return NextResponse.json({ error: 'failed to read brief' }, { status: 500 })
  }
}
