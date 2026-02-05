import { NextResponse } from 'next/server'
import { getAllMemories, createMemory, updateMemory, deleteMemory, searchMemories } from '@/lib/memories'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (query) {
      const memories = searchMemories(query)
      return NextResponse.json(memories)
    }
    
    const memories = getAllMemories()
    return NextResponse.json(memories)
  } catch (error) {
    console.error('Error fetching memories:', error)
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const memory = createMemory(body)
    return NextResponse.json(memory, { status: 201 })
  } catch (error) {
    console.error('Error creating memory:', error)
    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json({ error: 'Memory ID required' }, { status: 400 })
    }
    const memory = updateMemory(id, updates)
    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
    }
    return NextResponse.json(memory)
  } catch (error) {
    console.error('Error updating memory:', error)
    return NextResponse.json({ error: 'Failed to update memory' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Memory ID required' }, { status: 400 })
    }
    deleteMemory(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting memory:', error)
    return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 })
  }
}
