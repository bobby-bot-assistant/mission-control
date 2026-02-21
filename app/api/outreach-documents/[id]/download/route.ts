import { NextResponse } from 'next/server'
import { getDocumentById } from '@/lib/outreach-documents'
import fs from 'fs/promises'
import path from 'path'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const doc = getDocumentById(params.id)
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    // If it has inline content, return as text
    if (doc.content && !doc.file_path) {
      return new Response(doc.content, {
        headers: {
          'Content-Type': doc.mime_type || 'text/plain',
          'Content-Disposition': `attachment; filename="${doc.filename}"`,
        },
      })
    }

    // If it has a file path, read and return the file
    if (doc.file_path) {
      const filePath = path.join(process.cwd(), 'public', doc.file_path)
      try {
        await fs.access(filePath)
      } catch {
        return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
      }
      const buffer = await fs.readFile(filePath)
      return new Response(buffer, {
        headers: {
          'Content-Type': doc.mime_type || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${doc.filename}"`,
        },
      })
    }

    return NextResponse.json({ error: 'No content available' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to download document' }, { status: 500 })
  }
}
