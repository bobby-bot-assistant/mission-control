import { NextResponse } from 'next/server'
import { readJSON, writeJSON } from '@/lib/data'

const DATA_PATH = 'sprint-metrics.json'

const DEFAULT_METRICS = {
  currentSprint: null,
  previousSprints: [],
  buildFrequency: { last7Days: 0, last30Days: 0, avgPerDay: 0 },
  contentOutput: {},
  agentActivity: {},
  milestones: []
}

export async function GET() {
  try {
    const data = await readJSON<any>(DATA_PATH)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(DEFAULT_METRICS)
  }
}

export async function PUT(request: Request) {
  try {
    const updates = await request.json()
    let data: any
    try { data = await readJSON<any>(DATA_PATH) }
    catch { data = {} }
    const merged = { ...data, ...updates, lastUpdated: new Date().toISOString() }
    await writeJSON(DATA_PATH, merged)
    return NextResponse.json(merged)
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
