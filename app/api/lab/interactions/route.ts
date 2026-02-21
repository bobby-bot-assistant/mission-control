import { NextResponse } from 'next/server'
import { readJSONArray, writeJSON } from '@/lib/data'
import { dataPath } from '@/lib/config'

const INTERACTIONS_FILE = dataPath('lab-interactions.json')

export async function GET() {
  try {
    const data = await readJSONArray<any>(INTERACTIONS_FILE)
    // Return last 50 interactions
    return NextResponse.json(data.slice(-50))
  } catch (error) {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const interaction = await request.json()
    interaction.timestamp = new Date().toISOString()
    interaction.id = `int-${Date.now()}`
    
    const data = await readJSONArray<any>(INTERACTIONS_FILE)
    data.push(interaction)
    
    // Keep last 500 interactions
    const trimmed = data.slice(-500)
    await writeJSON(INTERACTIONS_FILE, trimmed)
    
    return NextResponse.json(interaction, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log interaction' }, { status: 500 })
  }
}
