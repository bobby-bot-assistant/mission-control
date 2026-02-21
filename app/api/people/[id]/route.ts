import { NextResponse } from 'next/server'
import { getPersonById, updatePerson } from '@/lib/people'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const person = getPersonById(params.id)
    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }
    return NextResponse.json(person)
  } catch (error) {
    console.error('Error fetching person:', error)
    return NextResponse.json({ error: 'Failed to fetch person' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const person = updatePerson(params.id, body)
    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }
    return NextResponse.json(person)
  } catch (error) {
    console.error('Error updating person:', error)
    return NextResponse.json({ error: 'Failed to update person' }, { status: 500 })
  }
}
