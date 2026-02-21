import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'
import { dataPath } from '@/lib/config'
import { readJSON } from '@/lib/data'

const PIPELINE_DIR = dataPath('pipeline')

interface BriefSection {
  title: string
  content: string
}

function parseMarkdownBrief(markdown: string, id: string) {
  const lines = markdown.split('\n')
  
  // Extract title from first H1
  const titleLine = lines.find(l => l.startsWith('# '))
  const title = titleLine ? titleLine.replace(/^#\s+/, '') : id
  
  // Parse sections by H2
  const sections: BriefSection[] = []
  let currentSection: BriefSection | null = null
  
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentSection) sections.push(currentSection)
      currentSection = { title: line.replace(/^##\s+/, '').replace(/^\d+\.\s+/, ''), content: '' }
    } else if (currentSection) {
      currentSection.content += line + '\n'
    }
  }
  if (currentSection) sections.push(currentSection)
  
  // Clean up section content
  sections.forEach(section => {
    section.content = section.content.trim()
  })
  
  return {
    id,
    title,
    sections,
    rawMarkdown: markdown,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'pending' as 'pending' | 'approved' | 'changes-requested' | 'archived'
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Try to find the brief markdown
  const briefPath = path.join(PIPELINE_DIR, `${id}-brief.md`)
  
  try {
    await fs.access(briefPath)
  } catch {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
  }
  
  try {
    const markdown = await fs.readFile(briefPath, 'utf-8')
    const brief = parseMarkdownBrief(markdown, id)
    
    // Try to load metadata from pipeline-state.json
    try {
      const state = await readJSON<{ items?: Record<string, any> }>('pipeline-state.json')
      const item = state.items?.[id]
      if (item) {
        if (item.stage === 'prd') {
          brief.status = 'approved'
        } else if (item.stage === 'idea') {
          brief.status = 'pending'
        }
      }
    } catch {
      // Pipeline state file doesn't exist or is invalid - continue with defaults
    }
    
    return NextResponse.json(brief)
  } catch (error) {
    console.error('Failed to parse brief:', error)
    return NextResponse.json({ error: 'Failed to parse brief' }, { status: 500 })
  }
}
