import { NextResponse } from 'next/server'
import path from 'path'
import os from 'os'
import { promises as fs } from 'fs'

const ROOT_DIR = path.join(os.homedir(), 'openclaw-projects')
const ALLOWED_EXTENSIONS = new Set(['.md', '.txt', '.pdf', '.jpg', '.png', '.json'])
const TEXT_EXTENSIONS = new Set(['.md', '.txt', '.json'])

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const relPath = searchParams.get('path')

    if (!relPath) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }

    const decodedPath = decodeURIComponent(relPath)
    const fullPath = path.resolve(ROOT_DIR, decodedPath)

    if (!fullPath.startsWith(ROOT_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    const ext = path.extname(fullPath).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    const stat = await fs.stat(fullPath).catch(() => null)
    if (!stat || !stat.isFile()) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    if (TEXT_EXTENSIONS.has(ext)) {
      const content = await fs.readFile(fullPath, 'utf-8')
      return NextResponse.json({
        path: decodedPath,
        extension: ext,
        content,
      })
    }

    const buffer = await fs.readFile(fullPath)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      },
    })
  } catch (error) {
    console.error('Error fetching document content:', error)
    return NextResponse.json({ error: 'Failed to fetch document content' }, { status: 500 })
  }
}
