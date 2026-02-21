import { NextResponse } from 'next/server'
import { readJSON, writeJSON, getFileVersion, VersionConflictError } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await readJSON<{ analyses: any[] }>('analyses.json')
    return NextResponse.json(data.analyses || [])
  } catch (error) {
    console.error('Failed to load analyses:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const analysis = await request.json()
    const version = await getFileVersion('analyses.json')
    const data = await readJSON<{ analyses: any[] }>('analyses.json')
    const content = { analyses: data.analyses || [] }

    const existingIndex = content.analyses.findIndex((a: any) => a.id === analysis.id)
    if (existingIndex >= 0) {
      content.analyses[existingIndex] = analysis
    } else {
      content.analyses.push(analysis)
    }

    await writeJSON('analyses.json', content, version)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof VersionConflictError) {
      return NextResponse.json({ error: 'File was modified. Please retry.' }, { status: 409 })
    }
    console.error('Failed to save analysis:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
