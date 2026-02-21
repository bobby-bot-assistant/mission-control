import { NextResponse } from 'next/server'
import { readJSON, writeJSON } from '@/lib/data'

const LAB_FILE = 'lab-items.json'

export async function GET() {
  try {
    const data = await readJSON<any[]>(LAB_FILE)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const newItem = await request.json()
    
    // Validate required fields
    if (!newItem.title || newItem.title.trim() === '') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }
    if (!newItem.description || newItem.description.trim() === '') {
      return NextResponse.json({ error: 'description is required' }, { status: 400 })
    }
    if (!newItem.type) {
      return NextResponse.json({ error: 'type is required' }, { status: 400 })
    }
    if (!newItem.status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }
    if (!newItem.priority) {
      return NextResponse.json({ error: 'priority is required' }, { status: 400 })
    }
    if (!newItem.tags || !Array.isArray(newItem.tags)) {
      return NextResponse.json({ error: 'tags is required and must be an array' }, { status: 400 })
    }
    
    // Set defaults for optional fields
    if (!newItem.builtBy) {
      newItem.builtBy = 'System'
    }
    
    const items = await readJSON<any[]>(LAB_FILE)
    
    newItem.id = newItem.id || `lab-${Date.now()}`
    newItem.builtDate = newItem.builtDate || new Date().toISOString().split('T')[0]
    items.push(newItem)
    
    await writeJSON(LAB_FILE, items)
    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const update = await request.json()
    const items = await readJSON<any[]>(LAB_FILE)
    const idx = items.findIndex((i: any) => i.id === update.id)
    
    if (idx === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
    
    items[idx] = { ...items[idx], ...update }
    await writeJSON(LAB_FILE, items)
    return NextResponse.json(items[idx])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}
