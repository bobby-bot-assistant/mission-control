import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

const PULSE_RESEARCH_DIR = '/Users/daisydukes/openclaw-projects/pulse/docs/research'

interface ResearchDoc {
  filename: string
  title: string
  content: string
  lastModified: string
  size: number
}

// Extract title from markdown content (first H1 or filename)
function extractTitle(content: string, filename: string): string {
  const h1Match = content.match(/^#\s+(.+)$/m)
  if (h1Match) {
    return h1Match[1].trim()
  }
  // Fallback to filename without extension
  return filename.replace(/\.md$/, '').replace(/-/g, ' ')
}

// Extract date from content (looks for YYYY-MM-DD pattern)
function extractDate(content: string): string | null {
  const dateMatch = content.match(/\b(\d{4}-\d{2}-\d{2})\b/)
  return dateMatch ? dateMatch[1] : null
}

// Extract summary (first paragraph after title)
function extractSummary(content: string): string {
  // Skip the title line and get first meaningful paragraph
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
      // Stop at next header or after 2-3 lines
      if (trimmed.startsWith('##')) break
      summaryLines.push(trimmed)
      if (summaryLines.length >= 2) break
    }
  }
  
  return summaryLines.join(' ').slice(0, 300) + (summaryLines.join(' ').length > 300 ? '...' : '')
}

export async function GET() {
  try {
    // Read all markdown files from the research directory
    const files = await fs.readdir(PULSE_RESEARCH_DIR)
    const mdFiles = files.filter(f => f.endsWith('.md'))
    
    const docs: ResearchDoc[] = await Promise.all(
      mdFiles.map(async (filename) => {
        const filePath = path.join(PULSE_RESEARCH_DIR, filename)
        const stats = await fs.stat(filePath)
        const content = await fs.readFile(filePath, 'utf-8')
        
        return {
          filename,
          title: extractTitle(content, filename),
          content,
          lastModified: stats.mtime.toISOString(),
          size: stats.size
        }
      })
    )
    
    // Add metadata to each doc
    const docsWithMeta = docs.map(doc => ({
      ...doc,
      date: extractDate(doc.content) || doc.lastModified.split('T')[0],
      summary: extractSummary(doc.content)
    }))
    
    return NextResponse.json({
      documents: docsWithMeta,
      count: docsWithMeta.length,
      source: PULSE_RESEARCH_DIR
    })
  } catch (error) {
    console.error('Error reading research directory:', error)
    return NextResponse.json({ 
      error: 'Failed to load research documents',
      details: String(error)
    }, { status: 500 })
  }
}
