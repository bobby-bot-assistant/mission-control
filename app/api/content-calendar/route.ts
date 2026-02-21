import { NextResponse, NextRequest } from 'next/server'
import fs from 'fs/promises'

export const dynamic = 'force-dynamic'

const CONTENT_CALENDAR_PATH = '/Users/daisydukes/openclaw-projects/mission-control-data/content-calendar.json'

// Auto-archive: mark sent items older than 7 days as archived
function autoArchive(calendar: any) {
  const now = new Date()
  let changed = false
  for (const day of calendar.days) {
    for (const item of day.items) {
      if (item.status === 'sent' && item.sentAt) {
        const daysDiff = (now.getTime() - new Date(item.sentAt).getTime()) / (1000 * 60 * 60 * 24)
        if (daysDiff >= 7) {
          item.status = 'archived'
          item.archivedAt = now.toISOString()
          changed = true
        }
      }
    }
  }
  return changed
}

export async function GET() {
  try {
    const raw = await fs.readFile(CONTENT_CALENDAR_PATH, 'utf-8')
    const calendar = JSON.parse(raw)

    // Run auto-archive and persist if anything changed
    if (autoArchive(calendar)) {
      await fs.writeFile(CONTENT_CALENDAR_PATH, JSON.stringify(calendar, null, 2))
    }

    return NextResponse.json(calendar)
  } catch (error) {
    // Return empty structure if file missing
    return NextResponse.json({
      metadata: {
        cadence: 'weekly',
        ratioTarget: '3:1 (mission:product)',
        categories: {
          mission: { color: '#22c55e', label: 'Mission & Movement' },
          builders_log: { color: '#3b82f6', label: "Builder's Log" },
          product: { color: '#f97316', label: 'Product & Proof' }
        }
      },
      days: [],
      ratioMetrics: {
        month: new Date().toISOString().slice(0, 7),
        mission: 0,
        builders_log: 0,
        product: 0,
        total: 0,
        ratio: '0:0'
      }
    })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { dayDate, itemIndex, update } = body

    const raw = await fs.readFile(CONTENT_CALENDAR_PATH, 'utf-8')
    const calendar = JSON.parse(raw)

    const day = calendar.days.find((d: any) => d.date === dayDate)
    if (!day) return NextResponse.json({ error: 'Day not found' }, { status: 404 })

    const item = day.items[itemIndex]
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    // Update status
    if (update.status) {
      item.status = update.status
      if (update.status === 'approved') item.approvedAt = new Date().toISOString()
      if (update.status === 'sent') item.sentAt = new Date().toISOString()
      if (update.status === 'archived') item.archivedAt = new Date().toISOString()
    }

    // Add feedback note
    if (update.feedbackNote) {
      if (!item.feedbackHistory) item.feedbackHistory = []
      item.feedbackHistory.push({
        id: `fb-${Date.now()}`,
        author: update.author || 'reviewer',
        note: update.feedbackNote,
        timestamp: new Date().toISOString(),
        action: update.action || update.status || 'note'
      })
    }

    // Run auto-archive across all items
    autoArchive(calendar)

    await fs.writeFile(CONTENT_CALENDAR_PATH, JSON.stringify(calendar, null, 2))

    return NextResponse.json({ success: true, item })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update', details: String(error) },
      { status: 500 }
    )
  }
}
