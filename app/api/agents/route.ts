import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { dataPath } from '@/lib/config'

export const dynamic = 'force-dynamic'

const ROSTER_PATH = dataPath('org/agent-roster.json')

const DEFAULT_ROSTER = [
  { name: 'Daisy', model: 'Opus', status: 'active', lastActivity: new Date().toISOString(), task: 'Mission Control development' },
  { name: 'Billy', model: 'GPT 5.2', status: 'idle', lastActivity: null, task: null },
  { name: 'Milo', model: 'GPT 5.2', status: 'dormant', lastActivity: null, task: null },
  { name: 'Iris', model: 'Gemini 3 Pro', status: 'dormant', lastActivity: null, task: null },
  { name: 'Fern', model: 'Sonnet', status: 'idle', lastActivity: null, task: null },
  { name: 'Harper', model: 'Sonnet', status: 'dormant', lastActivity: null, task: null },
  { name: 'Kobe', model: 'Sonnet', status: 'dormant', lastActivity: null, task: null },
  { name: 'River', model: 'Qwen 3 8B', status: 'dormant', lastActivity: null, task: null },
  { name: 'Bolt', model: 'Sonnet', status: 'dormant', lastActivity: null, task: null },
  { name: 'Scout', model: 'Sonnet', status: 'dormant', lastActivity: null, task: null },
]

export async function GET() {
  try {
    const data = await readFile(ROSTER_PATH, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch {
    return NextResponse.json(DEFAULT_ROSTER)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, ...updates } = body
    
    if (!name) {
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 })
    }
    
    let roster: any[]
    try {
      const data = await readFile(ROSTER_PATH, 'utf-8')
      roster = JSON.parse(data)
    } catch {
      roster = [...DEFAULT_ROSTER]
    }
    
    const idx = roster.findIndex((a: any) => a.name === name)
    if (idx === -1) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    
    // Update agent with provided fields
    roster[idx] = { ...roster[idx], ...updates }
    
    // Always update lastActivity to now
    roster[idx].lastActivity = new Date().toISOString()
    
    // Write back to file
    await writeFile(ROSTER_PATH, JSON.stringify(roster, null, 2))
    
    return NextResponse.json(roster[idx])
  } catch (error) {
    console.error('Error updating agent:', error)
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, model, status, task, title, role } = body
    
    if (!name) {
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 })
    }
    
    let roster: any[]
    try {
      const data = await readFile(ROSTER_PATH, 'utf-8')
      roster = JSON.parse(data)
    } catch {
      roster = [...DEFAULT_ROSTER]
    }
    
    // Check if agent with that name already exists
    const exists = roster.some((a: any) => a.name === name)
    if (exists) {
      return NextResponse.json({ error: 'Agent already exists' }, { status: 409 })
    }
    
    // Create new agent with defaults
    const newAgent = {
      name,
      model: model || null,
      status: status || 'proposed',
      task: task || null,
      title: title || null,
      role: role || null,
      lastActivity: new Date().toISOString(),
    }
    
    // Append to roster and write back
    roster.push(newAgent)
    await writeFile(ROSTER_PATH, JSON.stringify(roster, null, 2))
    
    return NextResponse.json(newAgent, { status: 201 })
  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body
    
    if (!name) {
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 })
    }
    
    let roster: any[]
    try {
      const data = await readFile(ROSTER_PATH, 'utf-8')
      roster = JSON.parse(data)
    } catch {
      roster = [...DEFAULT_ROSTER]
    }
    
    const idx = roster.findIndex((a: any) => a.name === name)
    if (idx === -1) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    
    // Remove agent from roster
    roster.splice(idx, 1)
    
    // Write back to file
    await writeFile(ROSTER_PATH, JSON.stringify(roster, null, 2))
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting agent:', error)
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 })
  }
}
