import { NextRequest, NextResponse } from 'next/server'
import { readJSON, writeJSON } from '@/lib/data'
import { message } from '@/lib/message' // Discord integration

/**
 * POST /api/agents/river/notify
 * 
 * River's notification hub for Mission Control user actions.
 * Logs actions and routes to appropriate agents.
 */

interface RiverNotification {
  action: string
  reviewId?: string
  userId?: string
  timestamp: string
  details: Record<string, any>
  notifyAgents: string[]
}

interface ActionLog {
  id: string
  action: string
  timestamp: string
  userId?: string
  notifiedAgents: string[]
  status: 'pending' | 'complete' | 'failed'
}

const AGENT_CHANNELS: Record<string, string> = {
  daisy: 'main',
  harper: 'harper',
  billy: 'billy',
  scout: 'scout',
  fern: 'fern',
  compass: 'compass',
  marshall: 'marshall',
  ada: 'ada',
}

export async function POST(request: NextRequest) {
  try {
    const body: RiverNotification = await request.json()
    const { action, reviewId, userId, details, notifyAgents } = body

    // Generate unique action ID
    const actionId = `action-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const timestamp = new Date().toISOString()

    // Log the action
    const logEntry: ActionLog = {
      id: actionId,
      action,
      timestamp,
      userId,
      notifiedAgents: notifyAgents,
      status: 'pending',
    }

    // Append to river-action-log.json
    try {
      const existing = await readJSON<ActionLog[]>('river-action-log.json')
      const logs = Array.isArray(existing) ? existing : []
      logs.push(logEntry)
      await writeJSON('river-action-log.json', logs)
    } catch (e) {
      console.error('Failed to log action:', e)
    }

    // Notify Discord #operations
    const discordMessage = `🎯 **Mission Control Action**
Action: ${action}
Review: ${reviewId || 'N/A'}
User: ${userId || 'unknown'}
Notifying: ${notifyAgents.join(', ')}
Details: ${JSON.stringify(details, null, 2).slice(0, 200)}`

    try {
      await message({
        action: 'send',
        target: '#operations',
        message: discordMessage,
      })
    } catch (e) {
      console.error('Discord notification failed:', e)
    }

    // Notify individual agents via sessions_send
    for (const agentId of notifyAgents) {
      const sessionKey = AGENT_CHANNELS[agentId.toLowerCase()]
      if (sessionKey) {
        try {
          await message({
            action: 'send',
            sessionKey,
            message: `[River] User action: ${action} on ${reviewId || 'Mission Control'}. Details: ${JSON.stringify(details)}`,
          })
        } catch (e) {
          console.error(`Failed to notify agent ${agentId}:`, e)
        }
      }
    }

    // Update log status
    logEntry.status = 'complete'
    try {
      const logs = await readJSON<ActionLog[]>('river-action-log.json')
      const idx = logs.findIndex(l => l.id === actionId)
      if (idx >= 0) {
        logs[idx] = logEntry
        await writeJSON('river-action-log.json', logs)
      }
    } catch (e) {
      console.error('Failed to update log status:', e)
    }

    return NextResponse.json({
      success: true,
      actionId,
      message: `Action logged and ${notifyAgents.length} agents notified`,
    })

  } catch (error: any) {
    console.error('River notification failed:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/agents/river/notify
 * 
 * Retrieve recent action log
 */
export async function GET() {
  try {
    const logs = await readJSON<ActionLog[]>('river-action-log.json')
    // Return last 50 actions, most recent first
    const recent = Array.isArray(logs) 
      ? logs.slice(-50).reverse() 
      : []
    return NextResponse.json({ actions: recent })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
