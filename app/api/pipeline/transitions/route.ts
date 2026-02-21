import { NextRequest, NextResponse } from 'next/server'
import { readJSON, writeJSON } from '@/lib/data'

interface Transition {
  id: string
  itemId: string
  itemTitle: string
  fromStage: string
  toStage: string
  action?: string
  triggeredBy: string
  timestamp: string
  status: 'pending' | 'approved' | 'rejected'
}

interface TransitionQueue {
  transitions: Transition[]
}

export async function GET() {
  try {
    const queue = await readJSON<TransitionQueue>('pipeline/transition-queue.json')
    return NextResponse.json(queue)
  } catch (error) {
    console.error('Error reading transition queue:', error)
    return NextResponse.json({ transitions: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, itemTitle, fromStage, toStage, action, triggeredBy = 'bobby' } = body
    
    if (!itemId || !fromStage || !toStage) {
      return NextResponse.json(
        { error: 'Missing required fields: itemId, fromStage, toStage' },
        { status: 400 }
      )
    }
    
    // Read current queue
    const queue = await readJSON<TransitionQueue>('pipeline/transition-queue.json')
    
    // Create new transition
    const transition: Transition = {
      id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId,
      itemTitle: itemTitle || '',
      fromStage,
      toStage,
      action,
      triggeredBy,
      timestamp: new Date().toISOString(),
      status: 'pending'
    }
    
    // Add to queue
    queue.transitions.push(transition)
    
    // Write back
    await writeJSON('pipeline/transition-queue.json', queue)
    
    return NextResponse.json({ success: true, transition })
  } catch (error) {
    console.error('Error adding transition:', error)
    return NextResponse.json(
      { error: 'Failed to add transition' },
      { status: 500 }
    )
  }
}
