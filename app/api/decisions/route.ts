import { NextResponse } from 'next/server'
import { readJSON, writeJSON, getFileVersion, VersionConflictError } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await readJSON<{ decisions: any[] }>('decisions.json')
    return NextResponse.json(data.decisions || [])
  } catch (error) {
    console.error('Failed to load decisions:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const decision = await request.json()
    const version = await getFileVersion('decisions.json')
    const data = await readJSON<{ decisions: any[] }>('decisions.json')
    const content = { decisions: data.decisions || [] }

    const existingIndex = content.decisions.findIndex((d: any) => d.id === decision.id)
    if (existingIndex >= 0) {
      content.decisions[existingIndex] = decision
    } else {
      content.decisions.push(decision)
    }

    await writeJSON('decisions.json', content, version)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof VersionConflictError) {
      return NextResponse.json({ error: 'File was modified. Please retry.' }, { status: 409 })
    }
    console.error('Failed to save decision:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
