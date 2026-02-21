import { NextResponse } from 'next/server'
import { readJSON, writeJSON, getFileVersion, VersionConflictError } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { talkingPointIndex, feedback, deleteEntireScript } = await request.json()
    const version = await getFileVersion('content-scripts.json')
    const data = await readJSON<{ scripts: any[]; deletedScripts?: any[] }>('content-scripts.json')
    const content = { scripts: data.scripts || [], deletedScripts: data.deletedScripts || [] }

    if (deleteEntireScript) {
      const scriptIndex = content.scripts.findIndex((s: any) => s.id === params.id)
      if (scriptIndex >= 0) {
        if (feedback) {
          content.deletedScripts.push({
            script: content.scripts[scriptIndex],
            feedback,
            deletedAt: new Date().toISOString()
          })
        }
        content.scripts.splice(scriptIndex, 1)
      }
    } else {
      const script = content.scripts.find((s: any) => s.id === params.id)
      if (script && script.talkingPoints && talkingPointIndex !== undefined) {
        if (feedback) {
          if (!script.deletedPoints) script.deletedPoints = []
          script.deletedPoints.push({
            point: script.talkingPoints[talkingPointIndex],
            feedback,
            deletedAt: new Date().toISOString()
          })
        }
        script.talkingPoints.splice(talkingPointIndex, 1)
      }
    }

    await writeJSON('content-scripts.json', content, version)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof VersionConflictError) {
      return NextResponse.json({ error: 'File was modified. Please retry.' }, { status: 409 })
    }
    console.error('Failed to delete:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    const version = await getFileVersion('content-scripts.json')
    const data = await readJSON<{ scripts: any[] }>('content-scripts.json')
    const content = { scripts: data.scripts || [] }

    const scriptIndex = content.scripts.findIndex((s: any) => s.id === params.id)
    if (scriptIndex >= 0) {
      content.scripts[scriptIndex] = {
        ...content.scripts[scriptIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }
    }

    await writeJSON('content-scripts.json', content, version)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof VersionConflictError) {
      return NextResponse.json({ error: 'File was modified. Please retry.' }, { status: 409 })
    }
    console.error('Failed to update script:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
