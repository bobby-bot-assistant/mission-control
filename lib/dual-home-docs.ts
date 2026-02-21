/**
 * Dual-Home Document Utility
 * 
 * This utility provides a pattern for rendering strategic/research documents
 * in Mission Control by simply dropping them in the correct directory.
 * 
 * Supported source directories:
 * - Strategy docs: ~/openclaw-projects/pulse/docs/ (for manifestos, etc.)
 * - Research docs: ~/openclaw-projects/pulse/docs/research/
 * 
 * Usage:
 * 
 * 1. For a new strategy document:
 *    Drop markdown file in ~/openclaw-projects/pulse/docs/
 *    Access via: /api/strategy?type=manifesto (for single docs)
 *    
 * 2. For a new research document:
 *    Drop markdown file in ~/openclaw-projects/pulse/docs/research/
 *    Auto-discovered by /api/research endpoint
 * 
 * 3. To create a custom endpoint for any document:
 *    import { readMarkdownFile, listMarkdownFiles } from '@/lib/dual-home-docs'
 *    
 *    // Read a single file
 *    const doc = await readMarkdownFile('/path/to/doc.md')
 *    
 *    // List all files in a directory
 *    const docs = await listMarkdownFiles('/path/to/docs/')
 */

import fs from 'fs/promises'
import path from 'path'

export const DUAL_HOME_PATHS = {
  pulse: {
    docs: '/Users/daisydukes/openclaw-projects/pulse/docs',
    research: '/Users/daisydukes/openclaw-projects/pulse/docs/research',
  },
  scout: {
    leads: '/Users/daisydukes/openclaw-projects/scout',
  }
} as const

/**
 * Read a markdown file and return with extracted metadata
 */
export async function readMarkdownFile(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8')
  const stats = await fs.stat(filePath)
  const filename = path.basename(filePath)
  
  return {
    filename,
    path: filePath,
    content,
    title: extractTitle(content, filename),
    date: extractDate(content) || stats.mtime.toISOString().split('T')[0],
    summary: extractSummary(content),
    lastModified: stats.mtime.toISOString(),
    size: stats.size,
  }
}

/**
 * List all markdown files in a directory with metadata
 */
export async function listMarkdownFiles(dirPath: string) {
  const files = await fs.readdir(dirPath)
  const mdFiles = files.filter(f => f.endsWith('.md'))
  
  return Promise.all(
    mdFiles.map(async (filename) => {
      const filePath = path.join(dirPath, filename)
      return readMarkdownFile(filePath)
    })
  )
}

/**
 * Read a JSON file (for leads database, etc.)
 */
export async function readJsonFile<T = any>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(content)
}

// Private helpers

function extractTitle(content: string, filename: string): string {
  const h1Match = content.match(/^#\s+(.+)$/m)
  if (h1Match) {
    return h1Match[1].trim()
  }
  return filename.replace(/\.md$/, '').replace(/-/g, ' ')
}

function extractDate(content: string): string | null {
  const dateMatch = content.match(/\b(\d{4}-\d{2}-\d{2})\b/)
  return dateMatch ? dateMatch[1] : null
}

function extractSummary(content: string): string {
  const lines = content.split('\n')
  let foundTitle = false
  let summaryLines: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('#')) {
      foundTitle = true
      continue
    }
    if (foundTitle && trimmed.length > 0) {
      if (trimmed.startsWith('##')) break
      summaryLines.push(trimmed)
      if (summaryLines.length >= 2) break
    }
  }
  
  const summary = summaryLines.join(' ').slice(0, 300)
  return summary + (summary.length >= 300 ? '...' : '')
}
