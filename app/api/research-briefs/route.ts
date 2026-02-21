import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

const DATA_ROOT = '/Users/daisydukes/openclaw-projects/mission-control-data'
const BRIEFS_FILE = path.join(DATA_ROOT, 'research-briefs.json')

export async function GET() {
  try {
    const raw = await fs.readFile(BRIEFS_FILE, 'utf-8')
    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (err) {
    console.error('Failed to read research-briefs.json:', err)
    return NextResponse.json({ briefs: [] })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, uploadedToNotebookLM } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    const raw = await fs.readFile(BRIEFS_FILE, 'utf-8')
    const data = JSON.parse(raw)

    const brief = data.briefs.find((b: any) => b.id === id)
    if (!brief) {
      return NextResponse.json({ error: 'brief not found' }, { status: 404 })
    }

    brief.uploadedToNotebookLM = uploadedToNotebookLM
    await fs.writeFile(BRIEFS_FILE, JSON.stringify(data, null, 2))

    return NextResponse.json({ ok: true, brief })
  } catch (err) {
    console.error('Failed to update research-briefs.json:', err)
    return NextResponse.json({ error: 'update failed' }, { status: 500 })
  }
}
