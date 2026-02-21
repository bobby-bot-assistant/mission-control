import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const AGENT_DEFAULTS = [
  { id: 'daisy', name: 'Daisy', emoji: '🌼', role: 'Lead Agent / Orchestrator', model: 'Claude Opus 4.6', color: '#10b981' },
  { id: 'scout', name: 'Scout', emoji: '🔍', role: 'Research & Intelligence', model: 'Brave Search + Gemini', color: '#3b82f6' },
  { id: 'iris', name: 'Iris', emoji: '🌸', role: 'Creative Director', model: 'Gemini 3 Pro', color: '#f59e0b' },
  { id: 'fern', name: 'Fern', emoji: '🌿', role: 'Developmental Reviews', model: 'MiniMax M2.5', color: '#22c55e' },
  { id: 'billy', name: 'Billy', emoji: '🔨', role: 'Engineering & Code', model: 'MiniMax M2.5', color: '#f97316' },
  { id: 'milo', name: 'Milo', emoji: '⚙️', role: 'CMS & Player', model: 'MiniMax M2.5', color: '#6366f1' },
  { id: 'harper', name: 'Harper', emoji: '🔎', role: 'QA & Testing', model: 'Playwright (no LLM)', color: '#14b8a6' },
  { id: 'kobe', name: 'Kobe', emoji: '✍️', role: 'LinkedIn Thought Leadership', model: 'Claude Opus 4.6', color: '#ec4899' },
  { id: 'river', name: 'River', emoji: '🌊', role: 'MC Sync & Content Relay', model: 'Claude Haiku', color: '#06b6d4' },
  { id: 'bolt', name: 'Bolt', emoji: '⚡', role: 'Deploy Pipeline', model: 'MiniMax M2.5', color: '#eab308' },
]

export async function GET() {
  let sessionState: Record<string, unknown> = {}
  try {
    const raw = await readFile(path.join(process.cwd(), '..', 'SESSION_STATE.json'), 'utf-8')
    sessionState = JSON.parse(raw)
  } catch { /* no session state */ }

  const agentStatus = (sessionState.agentStatus || {}) as Record<string, string>

  const agents = AGENT_DEFAULTS.map(agent => {
    const rawStatus = agentStatus[agent.id] || ''
    let status = 'idle'
    let task = 'Standing by'

    if (rawStatus.includes('active')) { status = 'active'; task = rawStatus.replace('active - ', '') }
    else if (rawStatus.includes('complete')) { status = 'complete'; task = rawStatus.replace('complete - ', '') }
    else if (rawStatus.includes('working')) { status = 'working'; task = rawStatus.replace('working - ', '') }

    return { ...agent, status, task, lastActive: (sessionState.timestamp as string) || new Date().toISOString() }
  })

  const now = new Date()
  const studioTime = now.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', hour12: true }) + ' PST'

  return NextResponse.json({ agents, studioTime })
}
