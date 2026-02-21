import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { dataPath } from '@/lib/config'
import { readJSON } from '@/lib/data'

const FEEDBACK_FILE = dataPath('pipeline/feedback.json')

export async function GET() {
  try {
    const feedbackList = await readJSON<any[]>('pipeline/feedback.json')
    return NextResponse.json(feedbackList || [])
  } catch (error) {
    // File doesn't exist yet, return empty array
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { briefId, feedback, status } = body

    if (!briefId || !feedback) {
      return NextResponse.json(
        { success: false, error: 'briefId and feedback are required' },
        { status: 400 }
      )
    }

    // Read existing feedback file or create new array
    let feedbackList: any[] = []
    try {
      const fileContent = await fs.readFile(FEEDBACK_FILE, 'utf-8')
      feedbackList = JSON.parse(fileContent)
    } catch (error: any) {
      // File doesn't exist or is invalid, start with empty array
      feedbackList = []
    }

    // Create new feedback entry
    const newEntry = {
      id: randomUUID(),
      briefId,
      feedback,
      status: 'pending',
      timestamp: new Date().toISOString(),
    }

    feedbackList.push(newEntry)

    // Ensure directory exists
    const dir = path.dirname(FEEDBACK_FILE)
    await fs.mkdir(dir, { recursive: true })

    // Write updated array back
    await fs.writeFile(FEEDBACK_FILE, JSON.stringify(feedbackList, null, 2))

    return NextResponse.json({ success: true, id: newEntry.id })
  } catch (error: any) {
    console.error('Error saving feedback:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
