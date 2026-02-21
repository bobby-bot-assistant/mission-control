import { NextResponse } from 'next/server'
import { readJSON, writeJSON, getFileVersion, VersionConflictError } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await readJSON<{ scripts: any[] }>('content-scripts.json')
    return NextResponse.json(data.scripts || [])
  } catch (error) {
    console.error('Failed to load content scripts:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const script = await request.json()
    const version = await getFileVersion('content-scripts.json')
    const data = await readJSON<{ scripts: any[] }>('content-scripts.json')
    const content = { scripts: data.scripts || [] }

    const existingIndex = content.scripts.findIndex((s: any) => s.id === script.id)
    if (existingIndex >= 0) {
      content.scripts[existingIndex] = script
    } else {
      content.scripts.push(script)
    }

    await writeJSON('content-scripts.json', content, version)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof VersionConflictError) {
      return NextResponse.json({ error: 'File was modified. Please retry.' }, { status: 409 })
    }
    console.error('Failed to save content script:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json()
    const version = await getFileVersion('content-scripts.json')
    const data = await readJSON<{ scripts: any[] }>('content-scripts.json')
    const content = { scripts: data.scripts || [] }

    const script = content.scripts.find((s: any) => s.id === id)
    if (script) {
      script.status = status
      if (status === 'recorded') script.recordedDate = new Date().toISOString()
      else if (status === 'published') script.publishedDate = new Date().toISOString()
    }

    await writeJSON('content-scripts.json', content, version)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof VersionConflictError) {
      return NextResponse.json({ error: 'File was modified. Please retry.' }, { status: 409 })
    }
    console.error('Failed to update content script:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
