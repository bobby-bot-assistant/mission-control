import { NextResponse } from 'next/server'
import { readJSON, writeJSON } from '@/lib/data'

const DATA_FILE = 'operations-items.json'

export async function GET() {
  try {
    const data = await readJSON<any[]>(DATA_FILE)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const newItem = await request.json()
    const items = await readJSON<any[]>(DATA_FILE)
    newItem.id = newItem.id || `ops-${Date.now()}`
    newItem.createdDate = newItem.createdDate || new Date().toISOString().split('T')[0]
    items.push(newItem)
    await writeJSON(DATA_FILE, items)
    return NextResponse.json(newItem, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const update = await request.json()
    const items = await readJSON<any[]>(DATA_FILE)
    const idx = items.findIndex((i: any) => i.id === update.id)
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    items[idx] = { ...items[idx], ...update }
    await writeJSON(DATA_FILE, items)
    return NextResponse.json(items[idx])
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
