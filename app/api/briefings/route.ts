import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { readJSON, writeJSON } from '@/lib/data'
import { dataPath } from '@/lib/config'

const BRIEFINGS_DIR = dataPath('briefings')

export async function GET() {
  try {
    let files: string[] = []
    try {
      files = (await fs.readdir(BRIEFINGS_DIR)).filter(f => f.endsWith('.json'))
    } catch {
      return NextResponse.json([])
    }
    
    const briefings = await Promise.all(
      files.map(async (f) => {
        const content = await fs.readFile(path.join(BRIEFINGS_DIR, f), 'utf8')
        return { ...JSON.parse(content), _file: f }
      })
    )
    briefings.sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at))
    return NextResponse.json(briefings)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { fileId, signalId, status } = await request.json()
    if (!fileId || !signalId || !status) {
      return NextResponse.json({ error: 'fileId, signalId, and status required' }, { status: 400 })
    }
    const filePath = path.join(BRIEFINGS_DIR, fileId)
    
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({ error: 'Briefing not found' }, { status: 404 })
    }
    
    const content = await fs.readFile(filePath, 'utf8')
    const briefing = JSON.parse(content)
    const signal = briefing.signals.find((s: any) => s.id === signalId)
    if (!signal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    }
    signal.status = status
    signal.decided_at = new Date().toISOString()
    await fs.writeFile(filePath, JSON.stringify(briefing, null, 2))
    return NextResponse.json(briefing)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
