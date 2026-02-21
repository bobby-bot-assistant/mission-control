import { NextResponse } from 'next/server'
import { readJSON, writeJSON } from '@/lib/data'

const FILE = 'decisions-interactions.json'

export async function GET() {
  try {
    const data = await readJSON<any[]>(FILE)
    return NextResponse.json(data.slice(-50))
  } catch { return NextResponse.json([]) }
}

export async function POST(request: Request) {
  try {
    const interaction = await request.json()
    interaction.timestamp = new Date().toISOString()
    interaction.id = `int-${Date.now()}`
    const data = await readJSON<any[]>(FILE)
    data.push(interaction)
    await writeJSON(FILE, data.slice(-500))
    return NextResponse.json(interaction, { status: 201 })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
