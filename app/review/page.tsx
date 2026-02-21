'use client'

import { useState, useEffect, useCallback } from 'react'

// ── Types ──

interface Job {
  id: string
  status: string
  source_type: string
  metadata: any
  created_at: string
  updated_at: string
}

interface ScriptPage {
  page: number
  text: string
  start_seconds: number
  end_seconds: number
  emotional_beat: string
}

interface CandidateLayer {
  id: string
  timestamp_seconds: number
  type: string
  trigger: { mode: string; timer_seconds: number | null; behavior: string }
  co_viewing: boolean
  content: any
  touch_targets: any
  ai_metadata: {
    suggested_by: string
    confidence: number
    rationale: string
    page_context?: string
    beat_at_point?: string
    placement_factors?: any
  }
}

interface IllustratedLayer {
  id?: string
  type: string
  confidence?: number
  rationale?: string
  content?: any
}

interface IllustratedPage {
  page?: number
  illustration_url: string
  text: string
  suggested_layers?: IllustratedLayer[]
}

interface FullJob {
  id: string
  status: string
  source_type: string
  source_data: any
  metadata: any
  script: {
    full_text: string
    pages: ScriptPage[]
    total_duration_seconds: number
    beat_summary: string[]
  } | null
  candidate_layers: CandidateLayer[] | null
  reviewed_layers: any[] | null
  pages?: IllustratedPage[] | null
}

type DecisionAction = 'accepted' | 'rejected' | 'modified'

interface Decision {
  layer_id: string
  action: DecisionAction
  modified_data?: any
  rationale?: string
  page_index?: number
}

// ── Constants ──

const LAYER_TYPES: Record<string, { icon: string; label: string; color: string }> = {
  choice_card:          { icon: '🃏', label: 'Choice Card',          color: 'bg-blue-500' },
  instructive_prompt:   { icon: '🗣️', label: 'Instructive Prompt',   color: 'bg-purple-500' },
  creative_expression:  { icon: '🎨', label: 'Creative Expression',  color: 'bg-pink-500' },
  away_from_screen:     { icon: '🏃', label: 'Away From Screen',     color: 'bg-green-500' },
  conversation_starter: { icon: '💬', label: 'Conversation Starter', color: 'bg-amber-500' },
  off_screen_engagement:{ icon: '🧸', label: 'Off-Screen Engagement',color: 'bg-orange-500' },
  breathing_exercise:   { icon: '🌬️', label: 'Breathing Exercise',   color: 'bg-cyan-500' },
  parent_handoff:       { icon: '👨‍👩‍👧', label: 'Parent Handoff',       color: 'bg-indigo-500' },
}

const LAYER_TYPE_ALIASES: Record<string, string> = {
  choice: 'choice_card',
  'choice card': 'choice_card',
  'instructive prompt': 'instructive_prompt',
  'creative expression': 'creative_expression',
  'away-from-screen': 'away_from_screen',
  'away from screen': 'away_from_screen',
  'conversation starter': 'conversation_starter',
  'off-screen engagement': 'off_screen_engagement',
  'breathing exercise': 'breathing_exercise',
  'parent handoff': 'parent_handoff',
}

const BEAT_COLORS: Record<string, string> = {
  setup: 'bg-slate-400',
  rising_action: 'bg-yellow-400',
  development: 'bg-orange-400',
  climax: 'bg-red-500',
  falling_action: 'bg-blue-400',
  resolution: 'bg-green-400',
  wind_down: 'bg-indigo-400',
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function ConfidenceBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? 'text-emerald-500' : pct >= 60 ? 'text-amber-500' : 'text-red-400'
  return (
    <span className={`font-mono text-sm font-semibold ${color}`}>
      {pct}%
    </span>
  )
}

function getLayerTypeKey(type: string) {
  if (!type) return 'unknown'
  const normalized = type.toLowerCase().replace(/\s+/g, ' ').trim()
  if (LAYER_TYPE_ALIASES[normalized]) return LAYER_TYPE_ALIASES[normalized]
  const snake = normalized.replace(/[-\s]/g, '_')
  if (LAYER_TYPES[snake]) return snake
  return snake
}

function getLayerInfo(type: string) {
  const key = getLayerTypeKey(type)
  return LAYER_TYPES[key] || { icon: '❓', label: type || 'Unknown', color: 'bg-gray-500' }
}

function getIllustratedLayerContent(layer: IllustratedLayer) {
  if (!layer) return ''
  return (
    layer.content?.prompt ||
    layer.content?.question ||
    layer.content?.instruction ||
    layer.content?.text ||
    (typeof layer.content === 'string' ? layer.content : '') ||
    ''
  )
}

function IllustratedLayerContentPreview({ content }: { content: any }) {
  if (!content || typeof content !== 'object') return null
  return (
    <div className="space-y-1.5">
      {content.instruction && <p><strong>Instruction:</strong> {content.instruction}</p>}
      {content.prompt && <p><strong>Prompt:</strong> {content.prompt}</p>}
      {content.question && <p><strong>Question:</strong> {content.question}</p>}
      {content.parent_cue && <p><strong>Parent Cue:</strong> {content.parent_cue}</p>}
      {content.parent_instruction && <p><strong>Parent:</strong> {content.parent_instruction}</p>}
      {content.options && (
        <div>
          <strong>Options:</strong>
          <ul className="ml-4 mt-1 space-y-0.5">
            {content.options.map((o: any, i: number) => (
              <li key={i}>{o.icon || '•'} <strong>{o.label}</strong>{o.outcome ? ` — ${o.outcome}` : ''}</li>
            ))}
          </ul>
        </div>
      )}
      {content.handoff_modes && (
        <div>
          <strong>Handoff Modes:</strong>
          <ul className="ml-4 mt-1 space-y-0.5">
            {content.handoff_modes.map((m: any, i: number) => (
              <li key={i}>{m.icon || '•'} <strong>{m.label}</strong>{m.description ? ` — ${m.description}` : ''}</li>
            ))}
          </ul>
        </div>
      )}
      {content.parent_prompt && <p><strong>Parent Prompt:</strong> {content.parent_prompt}</p>}
      {content.closing && <p><strong>Closing:</strong> {content.closing}</p>}
      {content.note && <p className="italic text-foreground-subtle">📝 {content.note}</p>}
      {content.energy_level && <p className="text-xs text-foreground-muted">⚡ Energy: {content.energy_level}</p>}
      {content.narration && <p><strong>Narration:</strong> {content.narration}</p>}
      {content.visual && (
        <p className="italic text-foreground-subtle">Visual: {content.visual.mood || content.visual.scene || ''}</p>
      )}
    </div>
  )
}

function getIllustratedLayerConfidence(layer: IllustratedLayer) {
  if (typeof layer.confidence === 'number') return layer.confidence
  if (typeof (layer as any).ai_metadata?.confidence === 'number') return (layer as any).ai_metadata.confidence
  return 0
}

// ── Main Component ──

export default function ReviewPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<FullJob | null>(null)
  const [decisions, setDecisions] = useState<Map<string, Decision>>(new Map())
  const [addedLayers, setAddedLayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingLayer, setEditingLayer] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [addingNewPage, setAddingNewPage] = useState<number | null>(null)

  // Fetch reviewable jobs
  useEffect(() => {
    async function fetchJobs() {
      setLoading(true)
      try {
        const res = await fetch('/api/cms/jobs')
        const data = await res.json()
        const reviewable = (data.jobs || []).filter(
          (j: Job) => ['detected', 'analyzed'].includes(j.status)
        )
        setJobs(reviewable)
      } catch (e: any) {
        setError('Failed to load jobs: ' + e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [submitted])

  const selectJob = useCallback(async (jobId: string) => {
    setLoading(true)
    setSubmitted(false)
    setDecisions(new Map())
    setAddedLayers([])
    setEditingLayer(null)
    setAddingNew(false)
    setAddingNewPage(null)
    try {
      const res = await fetch(`/api/cms/jobs/${jobId}`)
      const data = await res.json()
      setSelectedJob(data)
    } catch (e: any) {
      setError('Failed to load job: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const setDecision = (layerId: string, action: DecisionAction, modified_data?: any, rationale?: string, page_index?: number) => {
    setDecisions(prev => {
      const next = new Map(prev)
      next.set(layerId, { layer_id: layerId, action, modified_data, rationale, page_index })
      return next
    })
    if (action !== 'modified') setEditingLayer(null)
  }

  const isIllustrated = (selectedJob?.pages?.length || 0) > 0

  const getIllustratedLayerId = (pageIndex: number, layer: IllustratedLayer, layerIndex: number) => {
    return layer.id || `page-${pageIndex}-layer-${layerIndex}`
  }

  const illustratedLayers = isIllustrated
    ? (selectedJob?.pages || []).flatMap((page, pageIndex) =>
        (page.suggested_layers || []).map((layer, layerIndex) => ({ layer, pageIndex, layerIndex }))
      )
    : []

  const acceptAll = () => {
    const next = new Map<string, Decision>()
    if (isIllustrated) {
      for (const entry of illustratedLayers) {
        const id = getIllustratedLayerId(entry.pageIndex, entry.layer, entry.layerIndex)
        next.set(id, { layer_id: id, action: 'accepted', page_index: entry.pageIndex })
      }
    } else {
      if (!selectedJob?.candidate_layers) return
      for (const layer of selectedJob.candidate_layers) {
        next.set(layer.id, { layer_id: layer.id, action: 'accepted' })
      }
    }
    setDecisions(next)
  }

  const submitReview = async () => {
    if (!selectedJob) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/cms/jobs/${selectedJob.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisions: Array.from(decisions.values()),
          added_layers: addedLayers,
          decided_by: 'bobby',
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Review submission failed')
      }
      setSubmitted(true)
      setSelectedJob(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const addNewLayer = (layer: any) => {
    setAddedLayers(prev => [...prev, layer])
    setAddingNew(false)
  }

  const addNewIllustratedLayer = (pageIndex: number, layer: any) => {
    setAddedLayers(prev => [...prev, { ...layer, page_index: pageIndex }])
    setAddingNewPage(null)
  }

  const totalLayers = isIllustrated
    ? illustratedLayers.length
    : (selectedJob?.candidate_layers?.length || 0)
  const decidedCount = decisions.size
  const allDecided = isIllustrated
    ? illustratedLayers.every(({ layer, pageIndex, layerIndex }) => decisions.has(getIllustratedLayerId(pageIndex, layer, layerIndex)))
    : (selectedJob?.candidate_layers?.every(l => decisions.has(l.id)) ?? false)

  // ── Render ──

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">✅</div>
          <h2 className="text-2xl font-bold">Review Submitted</h2>
          <p className="text-foreground-subtle">Job advanced to &apos;reviewed&apos; status. Layers are ready for generation.</p>
          <button
            onClick={() => { setSubmitted(false); setSelectedJob(null); }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Review Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-surface">
        <div>
          <h1 className="text-xl font-bold">📋 CMS Review</h1>
          <p className="text-sm text-foreground-subtle">Review AI-suggested interactive layer insertion points</p>
        </div>
        {selectedJob && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground-subtle">
              {decidedCount}/{totalLayers} decided
            </span>
            <button
              onClick={acceptAll}
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              ✓ Accept All
            </button>
            <button
              onClick={submitReview}
              disabled={!allDecided || submitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting…' : '🚀 Submit Review'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 rounded-lg text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">×</button>
        </div>
      )}

      {/* No job selected: show job list */}
      {!selectedJob && (
        <div className="flex-1 overflow-auto p-6">
          <h2 className="text-lg font-semibold mb-4">Jobs Ready for Review</h2>
          {loading ? (
            <p className="text-foreground-subtle animate-pulse">Loading…</p>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 text-foreground-subtle">
              <div className="text-5xl mb-4">📭</div>
              <p>No jobs ready for review</p>
              <p className="text-sm mt-1">Jobs need to be in &apos;detected&apos; or &apos;analyzed&apos; status</p>
            </div>
          ) : (
            <div className="grid gap-4 max-w-3xl">
              {jobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => selectJob(job.id)}
                  className="text-left p-4 bg-surface border border-border rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {job.metadata?.title || job.metadata?.source_data?.title || 'Untitled'}
                      </h3>
                      <p className="text-sm text-foreground-subtle mt-1">
                        {job.source_type} • {job.id.slice(0, 8)}…
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'detected'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-subtle mt-2">
                    Created {new Date(job.created_at).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Illustrated job layout */}
      {selectedJob && !loading && isIllustrated && (
        <div className="flex-1 overflow-auto p-6">
          <button onClick={() => setSelectedJob(null)} className="text-sm text-blue-500 hover:underline mb-4 block">
            ← Back to jobs
          </button>
          <div className="mb-6">
            <h2 className="text-lg font-bold">
              {selectedJob.metadata?.title || selectedJob.source_data?.title || 'Untitled'}
            </h2>
            {selectedJob.metadata?.synopsis && (
              <p className="text-sm text-foreground-subtle mt-1">{selectedJob.metadata.synopsis}</p>
            )}
            <div className="flex gap-3 mt-2 text-xs text-foreground-subtle">
              <span>Source: {selectedJob.source_type}</span>
              <span>Status: {selectedJob.status}</span>
            </div>
          </div>

          <div className="space-y-6">
            {(selectedJob.pages || []).map((page, pageIndex) => {
              const suggestedLayers = page.suggested_layers || []
              const pageAdded = addedLayers.filter(l => l.page_index === pageIndex)

              return (
                <div key={pageIndex} className="p-4 bg-surface border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Page {page.page ?? pageIndex + 1}</h3>
                    <button
                      onClick={() => setAddingNewPage(addingNewPage === pageIndex ? null : pageIndex)}
                      className="text-xs px-3 py-1.5 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors"
                    >
                      + Add New Layer
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg overflow-hidden border border-border bg-surface-hover">
                      {page.illustration_url ? (
                        <img
                          src={page.illustration_url}
                          alt={`Illustration for page ${page.page ?? pageIndex + 1}`}
                          className="w-full h-auto object-contain"
                        />
                      ) : (
                        <div className="p-6 text-center text-foreground-subtle">No illustration available</div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground-subtle mb-2">Narration Text</h4>
                      <p className="text-sm leading-relaxed text-foreground-muted whitespace-pre-wrap">{page.text}</p>
                    </div>
                  </div>

                  {addingNewPage === pageIndex && (
                    <div className="mt-4">
                      <AddIllustratedLayerForm
                        onAdd={(layer) => addNewIllustratedLayer(pageIndex, layer)}
                        onCancel={() => setAddingNewPage(null)}
                      />
                    </div>
                  )}

                  <div className="mt-4 space-y-3">
                    <h4 className="text-xs font-semibold text-foreground-subtle">AI-Suggested Layers ({suggestedLayers.length})</h4>

                    {suggestedLayers.length === 0 && (
                      <div className="text-xs text-foreground-subtle">No suggestions for this page.</div>
                    )}

                    {suggestedLayers.map((layer, layerIndex) => {
                      const info = getLayerInfo(layer.type)
                      const layerId = getIllustratedLayerId(pageIndex, layer, layerIndex)
                      const decision = decisions.get(layerId)
                      const isEditing = editingLayer === layerId
                      const contentText = getIllustratedLayerContent(layer)
                      const confidence = getIllustratedLayerConfidence(layer)
                      const rationale = layer.rationale || (layer as any).ai_metadata?.rationale

                      return (
                        <div
                          key={layerId}
                          className={`p-4 bg-surface border rounded-xl transition-colors ${
                            decision?.action === 'accepted' ? 'border-emerald-400 dark:border-emerald-500/50' :
                            decision?.action === 'rejected' ? 'border-red-400 dark:border-red-500/50 opacity-60' :
                            decision?.action === 'modified' ? 'border-amber-400 dark:border-amber-500/50' :
                            'border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-8 h-8 rounded-lg ${info.color} flex items-center justify-center text-base`}>
                                {info.icon}
                              </span>
                              <div>
                                <span className="text-sm font-semibold">{info.label}</span>
                                <span className="text-xs text-foreground-subtle ml-2">Suggested</span>
                              </div>
                            </div>
                            <ConfidenceBadge score={confidence} />
                          </div>

                          {rationale && (
                            <p className="text-sm text-foreground-muted mb-2">{rationale}</p>
                          )}

                          <div className="text-xs text-foreground-subtle mb-3 p-2 bg-surface-hover rounded">
                            <IllustratedLayerContentPreview content={layer.content} />
                            {!layer.content && <p>No content defined</p>}
                          </div>

                          {isEditing && (
                            <ModifyIllustratedLayerForm
                              layer={layer}
                              onSave={(modified, rationaleText) => {
                                setDecision(layerId, 'modified', modified, rationaleText, pageIndex)
                                setEditingLayer(null)
                              }}
                              onCancel={() => setEditingLayer(null)}
                            />
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => setDecision(layerId, 'accepted', undefined, undefined, pageIndex)}
                              className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                                decision?.action === 'accepted'
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                              }`}
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => setDecision(layerId, 'rejected', undefined, undefined, pageIndex)}
                              className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                                decision?.action === 'rejected'
                                  ? 'bg-red-600 text-white border-red-600'
                                  : 'border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                              }`}
                            >
                              ✗ Reject
                            </button>
                            <button
                              onClick={() => setEditingLayer(isEditing ? null : layerId)}
                              className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                                decision?.action === 'modified'
                                  ? 'bg-amber-600 text-white border-amber-600'
                                  : 'border-amber-400 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                              }`}
                            >
                              ✎ Modify
                            </button>
                          </div>

                          {decision && (
                            <div className="mt-2 text-[10px] text-foreground-subtle">
                              Decision: {decision.action} {decision.rationale ? `— "${decision.rationale}"` : ''}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {pageAdded.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-xs font-semibold text-foreground-subtle mb-2">Manually Added ({pageAdded.length})</h4>
                        {pageAdded.map((layer, i) => {
                          const info = getLayerInfo(layer.type)
                          const globalIndex = addedLayers.indexOf(layer)
                          return (
                            <div key={`${pageIndex}-manual-${i}`} className="p-3 bg-surface border border-dashed border-blue-400 rounded-lg mb-2">
                              <div className="flex items-center gap-2">
                                <span>{info.icon}</span>
                                <span className="text-sm font-medium">{info.label}</span>
                                <button
                                  onClick={() => setAddedLayers(prev => prev.filter((_, j) => j !== globalIndex))}
                                  className="ml-auto text-xs text-red-500 hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Video job layout */}
      {selectedJob && !loading && !isIllustrated && (
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Script / Timeline */}
          <div className="w-1/2 border-r border-border overflow-auto p-6">
            {/* Job info */}
            <button onClick={() => setSelectedJob(null)} className="text-sm text-blue-500 hover:underline mb-4 block">
              ← Back to jobs
            </button>
            <div className="mb-6">
              <h2 className="text-lg font-bold">
                {selectedJob.metadata?.title || selectedJob.source_data?.title || 'Untitled'}
              </h2>
              {selectedJob.metadata?.synopsis && (
                <p className="text-sm text-foreground-subtle mt-1">{selectedJob.metadata.synopsis}</p>
              )}
              <div className="flex gap-3 mt-2 text-xs text-foreground-subtle">
                <span>Source: {selectedJob.source_type}</span>
                {selectedJob.script && (
                  <span>Duration: {formatTime(selectedJob.script.total_duration_seconds)}</span>
                )}
                <span>Status: {selectedJob.status}</span>
              </div>
            </div>

            {/* Visual Timeline */}
            {selectedJob.script && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2">Timeline</h3>
                <div className="relative h-12 bg-surface-hover rounded-lg overflow-hidden">
                  {/* Beat segments */}
                  {selectedJob.script.pages.map((page, i) => {
                    const total = selectedJob.script!.total_duration_seconds
                    const left = (page.start_seconds / total) * 100
                    const width = ((page.end_seconds - page.start_seconds) / total) * 100
                    return (
                      <div
                        key={i}
                        className={`absolute top-0 h-6 ${BEAT_COLORS[page.emotional_beat] || 'bg-gray-400'} opacity-60`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        title={`Page ${page.page}: ${page.emotional_beat} (${formatTime(page.start_seconds)}-${formatTime(page.end_seconds)})`}
                      />
                    )
                  })}
                  {/* Layer markers */}
                  {selectedJob.candidate_layers?.map((layer, i) => {
                    const total = selectedJob.script!.total_duration_seconds
                    const left = (layer.timestamp_seconds / total) * 100
                    const info = getLayerInfo(layer.type)
                    const decision = decisions.get(layer.id)
                    const opacity = decision?.action === 'rejected' ? 'opacity-30' : ''
                    return (
                      <div
                        key={layer.id}
                        className={`absolute bottom-0 w-5 h-5 rounded-full ${info.color} flex items-center justify-center text-[10px] cursor-pointer border-2 border-white dark:border-gray-800 ${opacity}`}
                        style={{ left: `${left}%`, transform: 'translateX(-50%)' }}
                        title={`${info.label} @ ${formatTime(layer.timestamp_seconds)}`}
                      >
                        {info.icon}
                      </div>
                    )
                  })}
                </div>
                {/* Beat legend */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedJob.script.beat_summary.map(beat => (
                    <span key={beat} className="flex items-center gap-1 text-[10px] text-foreground-subtle">
                      <span className={`w-2 h-2 rounded-full ${BEAT_COLORS[beat] || 'bg-gray-400'}`} />
                      {beat.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Script pages */}
            {selectedJob.script?.pages && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Script Pages</h3>
                {selectedJob.script.pages.map(page => {
                  // Find layers on this page
                  const pageLayers = selectedJob.candidate_layers?.filter(
                    l => l.timestamp_seconds >= page.start_seconds && l.timestamp_seconds < page.end_seconds
                  ) || []
                  return (
                    <div key={page.page} className="p-3 bg-surface border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">
                          Page {page.page} • {formatTime(page.start_seconds)}-{formatTime(page.end_seconds)}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${BEAT_COLORS[page.emotional_beat] || 'bg-gray-400'} text-white`}>
                          {page.emotional_beat.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground-muted leading-relaxed">{page.text}</p>
                      {pageLayers.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {pageLayers.map(l => {
                            const info = getLayerInfo(l.type)
                            return (
                              <span key={l.id} className="text-xs" title={info.label}>
                                {info.icon}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Suggestions panel */}
          <div className="w-1/2 overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">
                AI Suggestions ({selectedJob.candidate_layers?.length || 0})
              </h3>
              <button
                onClick={() => setAddingNew(true)}
                className="text-xs px-3 py-1.5 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors"
              >
                + Add New
              </button>
            </div>

            {/* Add new layer form */}
            {addingNew && (
              <AddLayerForm
                totalDuration={selectedJob.script?.total_duration_seconds || 600}
                onAdd={addNewLayer}
                onCancel={() => setAddingNew(false)}
              />
            )}

            {/* Candidate layers */}
            <div className="space-y-4">
              {selectedJob.candidate_layers?.map(layer => {
                const info = getLayerInfo(layer.type)
                const decision = decisions.get(layer.id)
                const isEditing = editingLayer === layer.id

                return (
                  <div
                    key={layer.id}
                    className={`p-4 bg-surface border rounded-xl transition-colors ${
                      decision?.action === 'accepted' ? 'border-emerald-400 dark:border-emerald-500/50' :
                      decision?.action === 'rejected' ? 'border-red-400 dark:border-red-500/50 opacity-60' :
                      decision?.action === 'modified' ? 'border-amber-400 dark:border-amber-500/50' :
                      'border-border'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-lg ${info.color} flex items-center justify-center text-base`}>
                          {info.icon}
                        </span>
                        <div>
                          <span className="text-sm font-semibold">{info.label}</span>
                          <span className="text-xs text-foreground-subtle ml-2">
                            @ {formatTime(layer.timestamp_seconds)}
                          </span>
                        </div>
                      </div>
                      <ConfidenceBadge score={layer.ai_metadata.confidence} />
                    </div>

                    {/* Rationale */}
                    <p className="text-sm text-foreground-muted mb-2">{layer.ai_metadata.rationale}</p>

                    {/* Details */}
                    <div className="flex flex-wrap gap-2 mb-3 text-xs">
                      <span className="px-2 py-0.5 bg-surface-hover rounded">
                        Trigger: {layer.trigger.mode}
                        {layer.trigger.timer_seconds && ` (${layer.trigger.timer_seconds}s)`}
                      </span>
                      {layer.ai_metadata.beat_at_point && (
                        <span className="px-2 py-0.5 bg-surface-hover rounded">
                          Beat: {layer.ai_metadata.beat_at_point.replace(/_/g, ' ')}
                        </span>
                      )}
                      {layer.ai_metadata.page_context && (
                        <span className="px-2 py-0.5 bg-surface-hover rounded italic max-w-xs truncate">
                          &ldquo;{layer.ai_metadata.page_context}&rdquo;
                        </span>
                      )}
                    </div>

                    {/* Content preview */}
                    {layer.content && (
                      <div className="text-xs text-foreground-subtle mb-3 p-2 bg-surface-hover rounded">
                        {layer.content.prompt && <p><strong>Prompt:</strong> {layer.content.prompt}</p>}
                        {layer.content.question && <p><strong>Q:</strong> {layer.content.question}</p>}
                        {layer.content.options && (
                          <p><strong>Options:</strong> {layer.content.options.map((o: any) => o.label || o).join(', ')}</p>
                        )}
                        {layer.content.instruction && <p><strong>Instruction:</strong> {layer.content.instruction}</p>}
                        {layer.content.parent_prompt && <p><strong>Parent Prompt:</strong> {layer.content.parent_prompt}</p>}
                        {layer.content.narration && <p><strong>Narration:</strong> {layer.content.narration}</p>}
                        {layer.content.closing && <p><strong>Closing:</strong> {layer.content.closing}</p>}
                        {layer.content.note && <p className="italic">📝 {layer.content.note}</p>}
                        {layer.content.energy_level && <p>⚡ Energy: {layer.content.energy_level}</p>}
                      </div>
                    )}

                    {/* Inline editor */}
                    {isEditing && (
                      <ModifyForm
                        layer={layer}
                        onSave={(modified, rationale) => {
                          setDecision(layer.id, 'modified', modified, rationale)
                          setEditingLayer(null)
                        }}
                        onCancel={() => setEditingLayer(null)}
                      />
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDecision(layer.id, 'accepted')}
                        className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                          decision?.action === 'accepted'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                        }`}
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => setDecision(layer.id, 'rejected')}
                        className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                          decision?.action === 'rejected'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                        }`}
                      >
                        ✗ Reject
                      </button>
                      <button
                        onClick={() => setEditingLayer(isEditing ? null : layer.id)}
                        className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                          decision?.action === 'modified'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'border-amber-400 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                        }`}
                      >
                        ✎ Modify
                      </button>
                    </div>

                    {decision && (
                      <div className="mt-2 text-[10px] text-foreground-subtle">
                        Decision: {decision.action} {decision.rationale ? `— "${decision.rationale}"` : ''}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Manually added layers */}
            {addedLayers.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2">Manually Added ({addedLayers.length})</h3>
                {addedLayers.map((layer, i) => {
                  const info = getLayerInfo(layer.type)
                  return (
                    <div key={i} className="p-3 bg-surface border border-dashed border-blue-400 rounded-lg mb-2">
                      <div className="flex items-center gap-2">
                        <span>{info.icon}</span>
                        <span className="text-sm font-medium">{info.label}</span>
                        <span className="text-xs text-foreground-subtle">@ {formatTime(layer.timestamp_seconds)}</span>
                        <button
                          onClick={() => setAddedLayers(prev => prev.filter((_, j) => j !== i))}
                          className="ml-auto text-xs text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedJob && loading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-foreground-subtle animate-pulse">Loading job…</p>
        </div>
      )}
    </div>
  )
}

// ── Modify Form ──

function ModifyForm({ layer, onSave, onCancel }: {
  layer: CandidateLayer
  onSave: (modified: any, rationale: string) => void
  onCancel: () => void
}) {
  const [triggerMode, setTriggerMode] = useState(layer.trigger.mode)
  const [timerSeconds, setTimerSeconds] = useState(layer.trigger.timer_seconds || 0)
  const [rationale, setRationale] = useState('')

  return (
    <div className="mb-3 p-3 bg-surface-hover rounded-lg space-y-2">
      <div className="flex gap-3">
        <label className="text-xs">
          Trigger Mode
          <select
            value={triggerMode}
            onChange={e => setTriggerMode(e.target.value)}
            className="block mt-1 text-xs px-2 py-1 bg-surface border border-border rounded"
          >
            <option value="action">Action</option>
            <option value="timer">Timer</option>
            <option value="combined">Combined</option>
          </select>
        </label>
        {(triggerMode === 'timer' || triggerMode === 'combined') && (
          <label className="text-xs">
            Timer (s)
            <input
              type="number"
              value={timerSeconds}
              onChange={e => setTimerSeconds(Number(e.target.value))}
              className="block mt-1 text-xs w-20 px-2 py-1 bg-surface border border-border rounded"
            />
          </label>
        )}
      </div>
      <label className="text-xs block">
        Rationale
        <input
          type="text"
          value={rationale}
          onChange={e => setRationale(e.target.value)}
          placeholder="Why this change?"
          className="block mt-1 w-full text-xs px-2 py-1 bg-surface border border-border rounded"
        />
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ trigger: { mode: triggerMode, timer_seconds: timerSeconds || null, behavior: layer.trigger.behavior } }, rationale)}
          className="px-3 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700"
        >
          Save Changes
        </button>
        <button onClick={onCancel} className="px-3 py-1 text-xs border border-border rounded hover:bg-surface-hover">
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Modify Illustrated Layer Form ──

function ModifyIllustratedLayerForm({ layer, onSave, onCancel }: {
  layer: IllustratedLayer
  onSave: (modified: any, rationale: string) => void
  onCancel: () => void
}) {
  const [prompt, setPrompt] = useState(getIllustratedLayerContent(layer))
  const [rationale, setRationale] = useState('')

  return (
    <div className="mb-3 p-3 bg-surface-hover rounded-lg space-y-2">
      <label className="text-xs block">
        Prompt / Content
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
          className="block mt-1 w-full text-xs px-2 py-1 bg-surface border border-border rounded"
        />
      </label>
      <label className="text-xs block">
        Rationale
        <input
          type="text"
          value={rationale}
          onChange={e => setRationale(e.target.value)}
          placeholder="Why this change?"
          className="block mt-1 w-full text-xs px-2 py-1 bg-surface border border-border rounded"
        />
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ content: { ...(typeof layer.content === 'object' ? layer.content : {}), prompt } }, rationale)}
          className="px-3 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700"
        >
          Save Changes
        </button>
        <button onClick={onCancel} className="px-3 py-1 text-xs border border-border rounded hover:bg-surface-hover">
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Add Layer Form ──

function AddLayerForm({ totalDuration, onAdd, onCancel }: {
  totalDuration: number
  onAdd: (layer: any) => void
  onCancel: () => void
}) {
  const [type, setType] = useState('choice_card')
  const [timestamp, setTimestamp] = useState(60)
  const [rationale, setRationale] = useState('')

  return (
    <div className="mb-4 p-4 bg-surface border border-dashed border-blue-400 rounded-xl space-y-3">
      <h4 className="text-sm font-semibold">Add New Layer</h4>
      <div className="flex gap-3">
        <label className="text-xs flex-1">
          Type
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="block mt-1 w-full text-xs px-2 py-1 bg-surface border border-border rounded"
          >
            {Object.entries(LAYER_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
        </label>
        <label className="text-xs w-28">
          Time (sec)
          <input
            type="number"
            min={0}
            max={totalDuration}
            value={timestamp}
            onChange={e => setTimestamp(Number(e.target.value))}
            className="block mt-1 w-full text-xs px-2 py-1 bg-surface border border-border rounded"
          />
        </label>
      </div>
      <label className="text-xs block">
        Rationale
        <input
          type="text"
          value={rationale}
          onChange={e => setRationale(e.target.value)}
          placeholder="Why add this layer here?"
          className="block mt-1 w-full text-xs px-2 py-1 bg-surface border border-border rounded"
        />
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => onAdd({ type, timestamp_seconds: timestamp, rationale, trigger: { mode: 'action' } })}
          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Layer
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-surface-hover">
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Add Illustrated Layer Form ──

function AddIllustratedLayerForm({ onAdd, onCancel }: {
  onAdd: (layer: any) => void
  onCancel: () => void
}) {
  const [type, setType] = useState('choice_card')
  const [prompt, setPrompt] = useState('')
  const [rationale, setRationale] = useState('')

  return (
    <div className="p-4 bg-surface border border-dashed border-blue-400 rounded-xl space-y-3">
      <h4 className="text-sm font-semibold">Add New Layer</h4>
      <label className="text-xs block">
        Type
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="block mt-1 w-full text-xs px-2 py-1 bg-surface border border-border rounded"
        >
          {Object.entries(LAYER_TYPES).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>
      </label>
      <label className="text-xs block">
        Prompt / Content
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
          className="block mt-1 w-full text-xs px-2 py-1 bg-surface border border-border rounded"
        />
      </label>
      <label className="text-xs block">
        Rationale
        <input
          type="text"
          value={rationale}
          onChange={e => setRationale(e.target.value)}
          placeholder="Why add this layer here?"
          className="block mt-1 w-full text-xs px-2 py-1 bg-surface border border-border rounded"
        />
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => onAdd({ type, content: { prompt }, rationale })}
          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Layer
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-surface-hover">
          Cancel
        </button>
      </div>
    </div>
  )
}
