import { NextResponse } from 'next/server'
import { getAllPeople, createPerson, updatePerson, deletePerson, searchPeople } from '@/lib/people'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (query) {
      const people = searchPeople(query)
      return NextResponse.json(people)
    }
    
    const people = getAllPeople()
    return NextResponse.json(people)
  } catch (error) {
    console.error('Error fetching people:', error)
    return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }
    
    const person = createPerson(body)
    return NextResponse.json(person, { status: 201 })
  } catch (error) {
    console.error('Error creating person:', error)
    return NextResponse.json({ error: 'Failed to create person' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json({ error: 'Person ID required' }, { status: 400 })
    }
    const person = updatePerson(id, updates)
    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }
    return NextResponse.json(person)
  } catch (error) {
    console.error('Error updating person:', error)
    return NextResponse.json({ error: 'Failed to update person' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Person ID required' }, { status: 400 })
    }
    deletePerson(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting person:', error)
    return NextResponse.json({ error: 'Failed to delete person' }, { status: 500 })
  }
}