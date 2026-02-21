import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { readJSON, writeJSON, getFileVersion, VersionConflictError } from '@/lib/data'

async function readData() {
  return readJSON<{ sprints: any[], tasks: any[] }>('build-tracker.json')
}

async function writeData(data: any, expectedVersion?: string) {
  return writeJSON('build-tracker.json', data, expectedVersion)
}

export async function GET() {
  const data = await readData()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const currentVersion = await getFileVersion('build-tracker.json')
    const data = await readData()

    // Handle simple POST with name (create task without explicit action)
    if (body.name && !body.action) {
      const task = {
        id: `task-${String(data.tasks.length + 1).padStart(3, '0')}`,
        sprintId: body.sprintId || 'sprint-1',
        title: body.name,
        description: body.description || '',
        acceptanceCriteria: body.acceptanceCriteria || [],
        agent: body.agent || 'Billy',
        status: body.status || 'backlog',
        codeChanges: [],
        qaStatus: null,
        feedback: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      data.tasks.push(task)
      await writeData(data, currentVersion)
      return NextResponse.json(task)
    }

    if (body.action === 'create-task') {
      const task = {
        id: `task-${String(data.tasks.length + 1).padStart(3, '0')}`,
        sprintId: body.sprintId || 'sprint-1',
        title: body.title,
        description: body.description || '',
        acceptanceCriteria: body.acceptanceCriteria || [],
        agent: body.agent || 'Billy',
        status: 'backlog',
        codeChanges: [],
        qaStatus: null,
        feedback: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      data.tasks.push(task)
      await writeData(data, currentVersion)
      return NextResponse.json(task)
    }

    if (body.action === 'update-task') {
      const idx = data.tasks.findIndex((t: any) => t.id === body.taskId)
      if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      data.tasks[idx] = { ...data.tasks[idx], ...body.updates, updatedAt: new Date().toISOString() }
      await writeData(data, currentVersion)
      return NextResponse.json(data.tasks[idx])
    }

    if (body.action === 'approve') {
      const idx = data.tasks.findIndex((t: any) => t.id === body.taskId)
      if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      data.tasks[idx].status = 'approved'
      data.tasks[idx].updatedAt = new Date().toISOString()
      await writeData(data, currentVersion)
      return NextResponse.json(data.tasks[idx])
    }

    if (body.action === 'reject') {
      const idx = data.tasks.findIndex((t: any) => t.id === body.taskId)
      if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      data.tasks[idx].status = 'backlog'
      data.tasks[idx].feedback = data.tasks[idx].feedback || []
      data.tasks[idx].feedback.push({
        id: `fb-${Date.now()}`,
        type: 'change-request',
        notes: body.notes || '',
        from: 'Bobby',
        createdAt: new Date().toISOString(),
      })
      data.tasks[idx].updatedAt = new Date().toISOString()
      await writeData(data, currentVersion)
      return NextResponse.json(data.tasks[idx])
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    if (error instanceof VersionConflictError) {
      return NextResponse.json(
        { error: 'File was modified by another process. Please retry.' },
        { status: 409 }
      )
    }
    console.error('Error in build-tracker POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
