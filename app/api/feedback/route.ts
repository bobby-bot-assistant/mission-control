import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const FEEDBACK_DIR = path.join(process.cwd(), '..', '..', 'feedback', 'pending')

export async function POST(request: Request) {
  try {
    const feedback = await request.json()
    
    // Ensure feedback directory exists
    await fs.mkdir(FEEDBACK_DIR, { recursive: true })
    
    // Save feedback to pending directory
    const filename = `${feedback.type}-${feedback.id}.json`
    const filepath = path.join(FEEDBACK_DIR, filename)
    
    await fs.writeFile(filepath, JSON.stringify(feedback, null, 2))
    
    return NextResponse.json({ success: true, id: feedback.id })
  } catch (error) {
    console.error('Failed to save feedback:', error)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check if feedback directory exists
    try {
      await fs.access(FEEDBACK_DIR)
    } catch {
      return NextResponse.json({ feedback: [] })
    }
    
    // Read all feedback files
    const files = await fs.readdir(FEEDBACK_DIR)
    const feedback = []
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(FEEDBACK_DIR, file), 'utf8')
        feedback.push(JSON.parse(content))
      }
    }
    
    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Failed to read feedback:', error)
    return NextResponse.json({ error: 'Failed to read feedback' }, { status: 500 })
  }
}