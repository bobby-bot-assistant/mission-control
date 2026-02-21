import { NextResponse } from 'next/server'
import path from 'path'
import os from 'os'
import { promises as fs } from 'fs'

const ROOT_DIR = path.join(os.homedir(), 'openclaw-projects')
const EXCLUDED_DIRS = new Set(['node_modules', '.git', 'dist', 'build'])
const ALLOWED_EXTENSIONS = new Set(['.md', '.txt', '.pdf', '.jpg', '.png', '.json'])

async function walk(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue
      await walk(fullPath, files)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (ALLOWED_EXTENSIONS.has(ext)) {
        files.push(fullPath)
      }
    }
  }

  return files
}

export async function GET() {
  try {
    const filePaths = await walk(ROOT_DIR)

    const documents = await Promise.all(
      filePaths.map(async filePath => {
        const stat = await fs.stat(filePath)
        const ext = path.extname(filePath).toLowerCase()
        return {
          path: path.relative(ROOT_DIR, filePath),
          name: path.basename(filePath),
          extension: ext,
          size: stat.size,
          created_at: stat.birthtime.toISOString(),
          modified_at: stat.mtime.toISOString(),
        }
      })
    )

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error listing documents:', error)
    return NextResponse.json({ error: 'Failed to list documents' }, { status: 500 })
  }
}
