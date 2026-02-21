import { NextResponse } from 'next/server'
import { readJSONArray, writeJSON } from '@/lib/data'
import { dataPath } from '@/lib/config'

const FILE = dataPath('projects-interactions.json')

export async function GET() {
  try {
    const data = await readJSONArray<any>(FILE)
    return NextResponse.json(data.slice(-50))
  } catch { return NextResponse.json([]) }
}

export async function POST(request: Request) {
  try {
    const interaction = await request.json()
    interaction.timestamp = new Date().toISOString()
    interaction.id = `int-${Date.now()}`
    const data = await readJSONArray<any>(FILE)
    data.push(interaction)
    await writeJSON(FILE, data.slice(-500))
    return NextResponse.json(interaction, { status: 201 })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
