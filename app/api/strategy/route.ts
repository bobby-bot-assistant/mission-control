import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { dataPath } from '@/lib/config'

export const dynamic = 'force-dynamic'

const STRATEGY_DIR = dataPath('strategy')
const PULSE_DOCS_DIR = '/Users/daisydukes/openclaw-projects/pulse/docs'

const STRATEGY_DOCS = [
  { slug: '2026-02-13-sprint35-wave2-complete', title: 'Sprint 3.5 Wave 2 Complete — Two-Product Architecture', icon: '✅', badge: 'COMPLETE' },
  { slug: '2026-02-12-illustrated-pipeline', title: 'Illustrated Pipeline Pivot (Feb 12)', icon: '🎨' },
  { slug: '2026-02-11-strategic-decisions', title: 'Strategic Decisions (Feb 11)', icon: '📋' },
  { slug: 'showcase-episodes', title: 'Showcase Episodes', icon: '🎬' },
  { slug: 'platform-constraints', title: 'Platform Constraints', icon: '⚠️' },
  { slug: 'product-roadmap', title: 'Product Roadmap', icon: '🗺️' },
  { slug: 'vision-and-architecture', title: 'Vision & Architecture', icon: '🏗️' },
  { slug: 'business-model', title: 'Business Model', icon: '💰' },
  { slug: 'market-and-positioning', title: 'Market & Positioning', icon: '🎯' },
  { slug: 'clinical-and-research', title: 'Clinical & Research', icon: '🔬' },
  { slug: 'design-system', title: 'Design System', icon: '🎨', badge: 'AWAITING APPROVAL' },
  { slug: 'technical-architecture', title: 'Technical Architecture', icon: '⚙️' },
  { slug: 'native-app-research', title: 'Native App Research', icon: '📱' },
  { slug: 'demo-and-fundraising', title: 'Demo & Fundraising', icon: '🎪' },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const type = searchParams.get('type')

  // Get Pulse Strategy Manifesto
  if (type === 'manifesto') {
    const manifestoPath = path.join(PULSE_DOCS_DIR, 'STRATEGY-MANIFESTO.md')
    try {
      const content = await fs.readFile(manifestoPath, 'utf-8')
      return NextResponse.json({ 
        content,
        source: 'STRATEGY-MANIFESTO.md',
        path: manifestoPath
      })
    } catch (error) {
      return NextResponse.json({ error: 'Manifesto not found' }, { status: 404 })
    }
  }

  // Get all: manifesto + archived docs (default behavior)
  // Read manifesto
  let manifestoData = null
  const manifestoPath = path.join(PULSE_DOCS_DIR, 'STRATEGY-MANIFESTO.md')
  try {
    const content = await fs.readFile(manifestoPath, 'utf-8')
    manifestoData = {
      content,
      source: 'STRATEGY-MANIFESTO.md',
      path: manifestoPath
    }
  } catch {
    // Manifesto not found, continue without it
  }

  if (slug) {
    const filePath = path.join(STRATEGY_DIR, `${slug}.md`)
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const content = await fs.readFile(filePath, 'utf-8')
    const doc = STRATEGY_DOCS.find(d => d.slug === slug)
    return NextResponse.json({ slug, title: doc?.title || slug, content, badge: doc?.badge })
  }

  // Return list with metadata
  const docs = await Promise.all(STRATEGY_DOCS.map(async (doc) => {
    const filePath = path.join(STRATEGY_DIR, `${doc.slug}.md`)
    let exists = false
    let stats = null
    let content = null
    try {
      await fs.access(filePath)
      exists = true
      stats = await fs.stat(filePath)
      // Read content for preview
      content = await fs.readFile(filePath, 'utf-8')
    } catch {
      exists = false
    }
    return {
      ...doc,
      exists,
      lastModified: stats?.mtime?.toISOString(),
      size: stats?.size,
      content: content,
      preview: content ? content.substring(0, 300) + (content.length > 300 ? '...' : '') : null
    }
  }))

  // Return both manifesto and archived docs
  return NextResponse.json({
    manifesto: manifestoData,
    archived: docs
  })
}
