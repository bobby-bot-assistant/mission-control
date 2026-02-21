import { NextResponse } from 'next/server'
import { getDocumentById } from '@/lib/outreach-documents'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const doc = getDocumentById(params.id)
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    return NextResponse.json(doc)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
  }
}
