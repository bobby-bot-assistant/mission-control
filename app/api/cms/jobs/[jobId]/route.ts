import { NextRequest, NextResponse } from 'next/server'

const CMS_BASE = 'http://localhost:3001/api/cms'

/**
 * Normalize candidate_layers to the shape the Review UI expects.
 * Backend stores flat fields (confidence, reasoning, page_index, etc.)
 * but the frontend expects ai_metadata.confidence, ai_metadata.rationale, etc.
 */
function normalizeLayers(layers: any[]): any[] {
  if (!Array.isArray(layers)) return []
  return layers.map(l => {
    // If already has ai_metadata, pass through
    if (l.ai_metadata?.confidence !== undefined) return l

    return {
      ...l,
      // Map flat fields into ai_metadata for the frontend
      ai_metadata: {
        suggested_by: 'cms_pipeline',
        confidence: l.confidence ?? 0,
        rationale: l.reasoning || '',
        page_context: l.page_excerpt || '',
        beat_at_point: l.emotional_beat || '',
      },
      // Ensure content exists (frontend renders it)
      content: l.content || {},
      co_viewing: l.co_viewing ?? true,
    }
  })
}

/**
 * Build illustrated pages from script pages + illustrations array.
 * Maps each script page to an IllustratedPage with illustration_url
 * and suggested_layers filtered by page_index.
 */
function buildIllustratedPages(job: any): any[] | null {
  if (!job.script?.pages?.length) return null

  const isIllustrated = job.metadata?.content_type === 'illustrated_story'
  const hasIllustrations = Array.isArray(job.illustrations) && job.illustrations.length > 0

  // Only build pages view if it's an illustrated story type
  if (!isIllustrated && !hasIllustrations) return null

  const illustrationMap = new Map<number, any>()
  if (hasIllustrations) {
    for (const ill of job.illustrations) {
      illustrationMap.set(ill.page, ill)
    }
  }

  // Deduplicate: candidate_layers and ai_suggestions often contain the same items
  const seenIds = new Set<string>()
  const allLayers: any[] = []
  for (const l of [...(job.candidate_layers || []), ...(job.ai_suggestions || [])]) {
    if (l.id && seenIds.has(l.id)) continue
    if (l.id) seenIds.add(l.id)
    allLayers.push(l)
  }

  return job.script.pages.map((page: any, idx: number) => {
    const pageNum = page.page ?? idx + 1
    const ill = illustrationMap.get(pageNum)

    // Find layers targeting this page (match by page number only, not array index)
    const pageLayers = allLayers
      .filter((l: any) => l.page_index === pageNum)
      .map((l: any) => ({
        id: l.id,
        type: l.type,
        confidence: l.confidence ?? l.ai_metadata?.confidence ?? 0,
        rationale: l.reasoning || l.ai_metadata?.rationale || '',
        content: l.content || {
          // Build content from available fields so the UI has something to show
          prompt: l.page_excerpt || '',
        },
        ai_metadata: l.ai_metadata || {
          suggested_by: 'cms_pipeline',
          confidence: l.confidence ?? 0,
          rationale: l.reasoning || '',
          page_context: l.page_excerpt || '',
          beat_at_point: l.emotional_beat || '',
        },
      }))

    return {
      page: pageNum,
      text: page.text,
      illustration_url: ill?.url || '',
      suggested_layers: pageLayers,
    }
  })
}

export async function GET(_req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { jobId } = await params as any
    const resp = await fetch(`${CMS_BASE}/jobs/${jobId}`, { cache: 'no-store' })
    const data = await resp.json()

    // Normalize for frontend consumption
    const pages = buildIllustratedPages(data)
    const normalized = {
      ...data,
      candidate_layers: normalizeLayers(data.candidate_layers),
      ...(pages ? { pages } : {}),
    }

    return NextResponse.json(normalized, { status: resp.status })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}
