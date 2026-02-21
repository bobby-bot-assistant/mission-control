'use client'

import { useState, useEffect } from 'react'

interface Story {
  id: string
  title: string
  year: number | null
  creator: string
  type: 'video' | 'story' | 'interactive' | 'both'
  duration: string
  ageRange: string
  copyrightStatus: string
  synopsis: string
  rationale: string
  ratings: {
    developmental: number
    therapeutic: number
    emotionalArc: number
    bedtime: number
    nostalgia: number
    cmsCompatibility: number
    readTogether: number
  }
  overall: string
  status: 'Showcase' | 'Under Review' | 'Queued' | 'Rejected'
  wave: number | null
  sourceUrl: string | null
  thumbnail: string | null
  cmsNotes: string
  parentHandoff: string | null
  showcaseLayers: string[] | null
  productionType?: 'existing_video' | 'text_only' | 'text_needs_animation'
  copyrightConfidence?: 'verified' | 'likely' | 'unverified'
  copyrightSource?: string
  videoUrl?: string | null
  archiveUrl?: string | null
  videoDuration?: string | null
  videoQualityNote?: string | null
}

const typeColors: Record<string, string> = {
  video: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
  story: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
  interactive: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30',
  both: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
}

const typeLabels: Record<string, string> = {
  video: '🎬 Video',
  story: '📖 Story',
  interactive: '🎮 Interactive',
  both: '🎬📖 Both',
}

const statusColors: Record<string, string> = {
  Showcase: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40',
  'Under Review': 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/40',
  Queued: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/40',
  Rejected: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40',
}

const gradeColors: Record<string, string> = {
  A: 'text-emerald-600 dark:text-emerald-400',
  B: 'text-blue-600 dark:text-blue-400',
  C: 'text-yellow-600 dark:text-yellow-400',
  D: 'text-red-600 dark:text-red-400',
}

function RatingBar({ value, max = 5, label }: { value: number; max?: number; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 text-foreground-subtle truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 dark:bg-amber-500/70 rounded-full transition-all"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="w-4 text-right text-foreground-subtle">{value}</span>
    </div>
  )
}

function StoryCard({ story, onClick }: { story: Story; onClick: () => void }) {
  const avgRating = Object.values(story.ratings).reduce((a, b) => a + b, 0) / Object.values(story.ratings).length

  return (
    <div
      onClick={onClick}
      className="bg-surface border border-border rounded-xl overflow-hidden hover:border-amber-400 dark:hover:border-amber-500/40 transition-all cursor-pointer group"
    >
      {/* Thumbnail area */}
      <div className="h-40 bg-gradient-to-br from-amber-100 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 flex items-center justify-center relative">
        <span className="text-5xl opacity-60">
          {story.type === 'video' ? '🎬' : story.type === 'story' ? '📖' : story.type === 'interactive' ? '🎮' : '🎬📖'}
        </span>
        {/* Status badge */}
        <div className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[story.status]}`}>
          {story.status}
        </div>
        {/* Grade badge */}
        <div className={`absolute top-3 left-3 text-2xl font-bold ${gradeColors[story.overall]}`}>
          {story.overall}
        </div>
        {/* Production type badge */}
        {story.productionType && (
          <div className={`absolute bottom-3 left-3 px-2 py-0.5 text-xs rounded-full ${
            story.productionType === 'existing_video' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' :
            story.productionType === 'text_needs_animation' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300' :
            'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300'
          }`}>
            {story.productionType === 'existing_video' ? '🎥 Has Video' :
             story.productionType === 'text_needs_animation' ? '🎨 Needs Animation' : '📝 Text Only'}
          </div>
        )}
        {/* Copyright confidence */}
        {story.copyrightConfidence && (
          <div className={`absolute bottom-3 right-3 px-2 py-0.5 text-xs rounded-full ${
            story.copyrightConfidence === 'verified' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' :
            story.copyrightConfidence === 'likely' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300' :
            'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
          }`}>
            {story.copyrightConfidence === 'verified' ? '✅ Verified PD' :
             story.copyrightConfidence === 'likely' ? '⚠️ Likely PD' : '❓ Unverified'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
            {story.title}
          </h3>
          <p className="text-xs text-foreground-subtle mt-1">
            {story.creator} {story.year && story.year > 0 ? `(${story.year})` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 text-xs rounded-full border ${typeColors[story.type]}`}>
            {typeLabels[story.type]}
          </span>
          <span className="text-xs text-foreground-subtle">{story.duration}</span>
          <span className="text-xs text-foreground-subtle">Ages {story.ageRange}</span>
        </div>

        <p className="text-xs text-foreground-muted line-clamp-2">{story.synopsis}</p>

        {/* Mini rating bar */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-foreground-subtle">CMS:</span>
          <div className="flex-1 h-1 bg-surface-hover rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 dark:bg-amber-500/70 rounded-full" style={{ width: `${(story.ratings.cmsCompatibility / 5) * 100}%` }} />
          </div>
          <span className="text-xs text-foreground-subtle">Bedtime:</span>
          <div className="flex-1 h-1 bg-surface-hover rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 dark:bg-blue-500/70 rounded-full" style={{ width: `${(story.ratings.bedtime / 5) * 100}%` }} />
          </div>
        </div>

        {story.showcaseLayers && (
          <div className="flex flex-wrap gap-1">
            {story.showcaseLayers.map((layer) => (
              <span key={layer} className="px-1.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded border border-emerald-300 dark:border-emerald-500/20">
                {layer}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

async function sendToCMS(story: Story) {
  try {
    const sourceData: Record<string, unknown> = {
      title: story.title,
      cultural_origin: story.creator,
      content_type: story.type,
      tags: [],
    }
    let sourceType = 'script_text'
    if (story.productionType === 'existing_video' && (story.videoUrl || story.archiveUrl || story.sourceUrl)) {
      sourceType = 'video_url'
      sourceData.url = story.videoUrl || story.archiveUrl || story.sourceUrl
    } else {
      sourceData.text = story.synopsis
    }
    const resp = await fetch('/api/cms-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _endpoint: '/api/cms/ingest', source_type: sourceType, source_data: sourceData }),
    })
    const data = await resp.json()
    if (data.job_id) {
      alert(`CMS project created! Job ID: ${data.job_id}`)
    } else {
      alert(`CMS error: ${data.error || 'Unknown error'}`)
    }
  } catch (e) {
    alert('Failed to connect to CMS API')
  }
}

function StoryDetail({ story, onClose, onStatusChange }: { story: Story; onClose: () => void; onStatusChange: (id: string, status: string) => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-3xl font-bold ${gradeColors[story.overall]}`}>{story.overall}</span>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{story.title}</h2>
                  <p className="text-sm text-foreground-subtle">{story.creator} {story.year && story.year > 0 ? `(${story.year})` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className={`px-2 py-0.5 text-xs rounded-full border ${typeColors[story.type]}`}>{typeLabels[story.type]}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColors[story.status]}`}>{story.status}</span>
                <span className="text-xs text-foreground-subtle">{story.duration}</span>
                <span className="text-xs text-foreground-subtle">Ages {story.ageRange}</span>
                {story.wave && <span className="text-xs text-foreground-subtle">Wave {story.wave}</span>}
              </div>
            </div>
            <button onClick={onClose} className="text-foreground-subtle hover:text-foreground text-xl p-1">x</button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Synopsis */}
          <div>
            <h3 className="text-sm font-semibold text-foreground-subtle uppercase tracking-wider mb-2">Synopsis</h3>
            <p className="text-sm text-foreground">{story.synopsis}</p>
          </div>

          {/* Iris Rationale */}
          <div>
            <h3 className="text-sm font-semibold text-foreground-subtle uppercase tracking-wider mb-2">Why This Content</h3>
            <p className="text-sm text-foreground">{story.rationale}</p>
          </div>

          {/* Ratings */}
          <div>
            <h3 className="text-sm font-semibold text-foreground-subtle uppercase tracking-wider mb-3">Ratings</h3>
            <div className="space-y-2">
              <RatingBar value={story.ratings.developmental} label="Developmental" />
              <RatingBar value={story.ratings.therapeutic} label="Therapeutic" />
              <RatingBar value={story.ratings.emotionalArc} label="Emotional Arc" />
              <RatingBar value={story.ratings.bedtime} label="Bedtime" />
              <RatingBar value={story.ratings.nostalgia} label="Nostalgia" />
              <RatingBar value={story.ratings.cmsCompatibility} label="CMS Compat" />
              <RatingBar value={story.ratings.readTogether} label="Read Together" />
            </div>
          </div>

          {/* CMS Notes */}
          <div>
            <h3 className="text-sm font-semibold text-foreground-subtle uppercase tracking-wider mb-2">CMS Interaction Notes</h3>
            <p className="text-sm text-foreground">{story.cmsNotes}</p>
          </div>

          {/* Parent Handoff */}
          {story.parentHandoff && (
            <div>
              <h3 className="text-sm font-semibold text-foreground-subtle uppercase tracking-wider mb-2">Parent Handoff</h3>
              <p className="text-sm text-foreground">{story.parentHandoff}</p>
            </div>
          )}

          {/* Showcase Layers */}
          {story.showcaseLayers && (
            <div>
              <h3 className="text-sm font-semibold text-foreground-subtle uppercase tracking-wider mb-2">Showcase Layer Types</h3>
              <div className="flex flex-wrap gap-2">
                {story.showcaseLayers.map((layer) => (
                  <span key={layer} className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg border border-emerald-300 dark:border-emerald-500/20">
                    {layer}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Production Type */}
          <div>
            <h3 className="text-sm font-semibold text-foreground-subtle uppercase tracking-wider mb-2">Production Type</h3>
            <p className="text-sm text-foreground">
              {story.productionType === 'existing_video' ? '🎥 Existing public domain video available' :
               story.productionType === 'text_needs_animation' ? '🎨 Text with illustrations, needs animation' :
               '📝 Text only, needs visual production'}
            </p>
          </div>

          {/* Copyright */}
          <div>
            <h3 className="text-sm font-semibold text-foreground-subtle uppercase tracking-wider mb-2">Copyright</h3>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                story.copyrightConfidence === 'verified' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' :
                story.copyrightConfidence === 'likely' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300' :
                'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
              }`}>
                {story.copyrightConfidence === 'verified' ? '✅ Verified Public Domain' :
                 story.copyrightConfidence === 'likely' ? '⚠️ Likely Public Domain' : '❓ Unverified'}
              </span>
            </div>
            <p className="text-sm text-foreground">{story.copyrightStatus}</p>
            {story.copyrightSource && <p className="text-xs text-foreground-subtle mt-1">{story.copyrightSource}</p>}
          </div>

          {/* Video Source */}
          {story.videoUrl && (
            <div>
              <h3 className="text-sm font-semibold text-foreground-subtle uppercase tracking-wider mb-2">Video Source</h3>
              <a href={story.videoUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline">
                Watch Video &rarr;
              </a>
              {story.videoDuration && <span className="text-xs text-foreground-subtle ml-2">({story.videoDuration})</span>}
              {story.videoQualityNote && <p className="text-xs text-foreground-subtle mt-1">{story.videoQualityNote}</p>}
            </div>
          )}

          {/* Source Link */}
          {story.sourceUrl && (
            <div>
              <h3 className="text-sm font-semibold text-foreground-subtle uppercase tracking-wider mb-2">Source Material</h3>
              <a
                href={story.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline"
              >
                View on {story.sourceUrl.includes('archive.org') ? 'Internet Archive' : story.sourceUrl.includes('gutenberg') ? 'Project Gutenberg' : 'Source'} &rarr;
              </a>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border flex items-center gap-3">
          <button
            onClick={() => onStatusChange(story.id, 'Showcase')}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              story.status === 'Showcase' ? 'bg-emerald-100 text-emerald-700 border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40' : 'bg-surface-hover text-foreground-muted border-border hover:border-emerald-400 dark:hover:border-emerald-500/40'
            }`}
          >
            Showcase
          </button>
          <button
            onClick={() => onStatusChange(story.id, 'Queued')}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              story.status === 'Queued' ? 'bg-slate-100 text-slate-700 border-slate-400 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/40' : 'bg-surface-hover text-foreground-muted border-border hover:border-slate-400 dark:hover:border-slate-500/40'
            }`}
          >
            Queue
          </button>
          <button
            onClick={() => onStatusChange(story.id, 'Rejected')}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              story.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-400 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40' : 'bg-surface-hover text-foreground-muted border-border hover:border-red-400 dark:hover:border-red-500/40'
            }`}
          >
            Reject
          </button>
          <div className="flex-1" />
          <button
            onClick={() => sendToCMS(story)}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Send to CMS &rarr;
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-surface-hover text-foreground-muted border border-border hover:text-foreground">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterProduction, setFilterProduction] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('wave')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetch('/api/stories')
      .then((r) => r.json())
      .then((data) => {
        setStories(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch('/api/stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: { status } }),
      })
      setStories((prev) => prev.map((s) => (s.id === id ? { ...s, status: status as Story['status'] } : s)))
      if (selectedStory?.id === id) {
        setSelectedStory((prev) => prev ? { ...prev, status: status as Story['status'] } : null)
      }
    } catch (e) {
      console.error('Failed to update status:', e)
    }
  }

  const filtered = stories
    .filter((s) => filterType === 'all' || s.type === filterType)
    .filter((s) => filterStatus === 'all' || s.status === filterStatus)
    .filter((s) => filterProduction === 'all' || s.productionType === filterProduction)
    .sort((a, b) => {
      if (sortBy === 'wave') return (a.wave || 99) - (b.wave || 99)
      if (sortBy === 'grade') return a.overall.localeCompare(b.overall)
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'bedtime') return b.ratings.bedtime - a.ratings.bedtime
      if (sortBy === 'cms') return b.ratings.cmsCompatibility - a.ratings.cmsCompatibility
      return 0
    })

  const showcaseCount = stories.filter((s) => s.status === 'Showcase').length
  const reviewCount = stories.filter((s) => s.status === 'Under Review').length
  const gradeACount = stories.filter((s) => s.overall === 'A').length
  const videoCount = stories.filter((s) => s.productionType === 'existing_video').length
  const textCount = stories.filter((s) => s.productionType === 'text_only').length

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p className="text-foreground-subtle">Loading stories...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 overflow-y-auto max-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Stories</h1>
        <p className="text-sm text-foreground-subtle mt-1">Content library for Story Hour with Simon. Curated by Iris.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-2xl font-bold text-foreground">{stories.length}</p>
          <p className="text-xs text-foreground-subtle">Total Stories</p>
        </div>
        <div className="bg-surface border border-emerald-300 dark:border-emerald-500/20 rounded-xl p-4">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{showcaseCount}</p>
          <p className="text-xs text-foreground-subtle">Showcase</p>
        </div>
        <div className="bg-surface border border-yellow-300 dark:border-yellow-500/20 rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{reviewCount}</p>
          <p className="text-xs text-foreground-subtle">Under Review</p>
        </div>
        <div className="bg-surface border border-amber-300 dark:border-amber-500/20 rounded-xl p-4">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{gradeACount}</p>
          <p className="text-xs text-foreground-subtle">Grade A</p>
        </div>
        <div className="bg-surface border border-green-300 dark:border-green-500/20 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{videoCount}</p>
          <p className="text-xs text-foreground-subtle">Has Video</p>
        </div>
        <div className="bg-surface border border-slate-300 dark:border-slate-500/20 rounded-xl p-4">
          <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">{textCount}</p>
          <p className="text-xs text-foreground-subtle">Text Only</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-subtle">Type:</span>
          {['all', 'video', 'story', 'interactive', 'both'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filterType === t ? 'bg-amber-100 text-amber-700 border-amber-400 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40' : 'bg-surface text-foreground-muted border-border hover:border-amber-400 dark:hover:border-amber-500/30'
              }`}
            >
              {t === 'all' ? 'All' : typeLabels[t]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-subtle">Status:</span>
          {['all', 'Showcase', 'Under Review', 'Queued', 'Rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filterStatus === s ? 'bg-amber-100 text-amber-700 border-amber-400 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40' : 'bg-surface text-foreground-muted border-border hover:border-amber-400 dark:hover:border-amber-500/30'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-subtle">Production:</span>
          {['all', 'existing_video', 'text_only', 'text_needs_animation'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterProduction(p)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filterProduction === p ? 'bg-amber-100 text-amber-700 border-amber-400 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40' : 'bg-surface text-foreground-muted border-border hover:border-amber-400 dark:hover:border-amber-500/30'
              }`}
            >
              {p === 'all' ? 'All' : p === 'existing_video' ? '🎥 Video' : p === 'text_only' ? '📝 Text' : '🎨 Needs Anim'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-subtle">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-surface border border-border rounded-lg px-2 py-1 text-xs text-foreground"
          >
            <option value="wave">Wave</option>
            <option value="grade">Grade</option>
            <option value="title">Title</option>
            <option value="bedtime">Bedtime Rating</option>
            <option value="cms">CMS Compatibility</option>
          </select>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' : 'text-foreground-muted hover:text-foreground'}`}
          >
            ▦
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' : 'text-foreground-muted hover:text-foreground'}`}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((story) => (
            <StoryCard key={story.id} story={story} onClick={() => setSelectedStory(story)} />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filtered.map((story) => (
            <div
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4 hover:border-amber-400 dark:hover:border-amber-500/40 transition-colors cursor-pointer"
            >
              <span className={`text-2xl font-bold w-8 ${gradeColors[story.overall]}`}>{story.overall}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{story.title}</h3>
                <p className="text-xs text-foreground-subtle">{story.creator} {story.year && story.year > 0 ? `(${story.year})` : ''}</p>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full border ${typeColors[story.type]}`}>{typeLabels[story.type]}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColors[story.status]}`}>{story.status}</span>
              <span className="text-xs text-foreground-subtle w-16 text-right">{story.duration}</span>
              <span className="text-xs text-foreground-subtle w-16 text-right">Ages {story.ageRange}</span>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground-subtle">No stories match the current filters.</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedStory && (
        <StoryDetail
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
