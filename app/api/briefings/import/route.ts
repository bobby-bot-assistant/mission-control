import { NextRequest, NextResponse } from 'next/server'
import { importBriefing } from '@/lib/briefings'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { date, filePath } = body

  // Default path pattern
  const briefingPath = filePath || path.join(process.cwd(), '..', 'agents', 'scout', 'briefings', `${date}.md`)

  try {
    await fs.access(briefingPath)
  } catch {
    return NextResponse.json({ error: `File not found: ${briefingPath}` }, { status: 404 })
  }

  const content = await fs.readFile(briefingPath, 'utf8')
  const briefing = importBriefing(date, content)
  return NextResponse.json(briefing)
}
