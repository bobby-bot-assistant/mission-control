import { NextResponse } from 'next/server'
import { createDocument } from '@/lib/outreach-documents'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string || ''
    const category = formData.get('category') as string || 'other'
    const tags = formData.get('tags') as string || ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    try {
      await fs.access(uploadsDir)
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true })
    }

    const uniqueName = `${Date.now()}-${file.name}`
    const filePath = path.join(uploadsDir, uniqueName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    // For text files, also store content inline
    let content: string | undefined
    if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      content = buffer.toString('utf8')
    }

    const doc = createDocument({
      title: title || file.name,
      filename: file.name,
      mime_type: file.type || 'application/octet-stream',
      content,
      file_path: `/uploads/${uniqueName}`,
      category: category as any,
      linked_contacts: [],
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}
