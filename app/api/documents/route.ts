import { NextResponse } from 'next/server'
import { getAllDocuments, createDocument, updateDocument, deleteDocument, searchDocuments, getDocumentsByProject, getDocumentsByType, autoCaptureDocument } from '@/lib/documents'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const projectId = searchParams.get('project')
    const type = searchParams.get('type')
    
    if (query) {
      const documents = searchDocuments(query)
      return NextResponse.json(documents)
    }
    
    if (projectId) {
      const documents = getDocumentsByProject(projectId)
      return NextResponse.json(documents)
    }
    
    if (type) {
      const documents = getDocumentsByType(type as any)
      return NextResponse.json(documents)
    }
    
    const documents = getAllDocuments()
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Check if this is an auto-capture request
    if (body.auto_capture && body.content) {
      const document = autoCaptureDocument(body.content, body.source_context)
      return NextResponse.json(document, { status: 201 })
    }
    
    const document = createDocument(body)
    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }
    const document = updateDocument(id, updates)
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    return NextResponse.json(document)
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }
    deleteDocument(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}