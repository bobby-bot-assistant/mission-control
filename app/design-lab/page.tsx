'use client'

import { useState, useEffect } from 'react'

interface DesignReview {
  id: string
  page: string
  description: string
  timestamp: string
  agent: string
  status: 'pending' | 'approved' | 'changes-requested'
  beforeScreenshot: string
  afterScreenshot: string
  notes: string
  feedback: string
}

interface DesignLabData {
  reviews: DesignReview[]
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'changes-requested'

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: {
    label: 'Pending Review',
    color: 'bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-600/20 dark:text-yellow-400 dark:border-yellow-500/30',
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-600/20 dark:text-green-400 dark:border-green-500/30',
  },
  'changes-requested': {
    label: 'Changes Requested',
    color: 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-600/20 dark:text-red-400 dark:border-red-500/30',
  },
}

export default function DesignLabPage() {
  const [reviews, setReviews] = useState<DesignReview[]>([])
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/design-lab')
      .then(r => r.json())
      .then((data: DesignLabData) => {
        setReviews(data.reviews || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const updateReview = async (id: string, fields: Partial<DesignReview>) => {
    setUpdating(id)
    try {
      const res = await fetch('/api/design-lab', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...fields }),
      })
      if (res.ok) {
        const updated = await res.json()
        setReviews(prev => prev.map(r => (r.id === id ? { ...r, ...updated } : r)))
      }
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.status === filter)

  const counts = {
    all: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    'changes-requested': reviews.filter(r => r.status === 'changes-requested').length,
  }

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'pending', label: `Pending Review (${counts.pending})` },
    { key: 'approved', label: `Approved (${counts.approved})` },
    { key: 'changes-requested', label: `Changes Requested (${counts['changes-requested']})` },
  ]

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto text-foreground-muted">Loading design reviews...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Design Lab 🎨</h1>
          <p className="text-foreground-muted text-sm mt-1">
            Review and approve design changes before production deployment
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface border border-border text-foreground-muted hover:text-foreground hover:bg-surface-hover'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="bg-surface border border-border rounded-lg p-8 text-center text-foreground-muted">
            No design reviews match the current filter.
          </div>
        )}

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filtered.map(review => (
            <DesignReviewCard
              key={review.id}
              review={review}
              updating={updating === review.id}
              onUpdate={updateReview}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function DesignReviewCard({
  review,
  updating,
  onUpdate,
}: {
  review: DesignReview
  updating: boolean
  onUpdate: (id: string, fields: Partial<DesignReview>) => void
}) {
  const [feedback, setFeedback] = useState(review.feedback || '')
  const config = statusConfig[review.status] || statusConfig.pending

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Card Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{review.page}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-foreground-muted text-sm font-mono">
                {new Date(review.timestamp).toLocaleString()}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30">
                {review.agent}
              </span>
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Screenshots */}
      <div className="p-5 border-b border-border">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-foreground-muted mb-2 font-medium uppercase tracking-wide">Before</p>
            <div className="rounded-lg border border-border overflow-hidden bg-background-subtle aspect-video flex items-center justify-center">
              {review.beforeScreenshot ? (
                <img
                  src={review.beforeScreenshot}
                  alt={`${review.page} before`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    if (target.parentElement) target.parentElement.innerHTML = '<span style="color:#71717a" class="text-sm">No screenshot available</span>'
                  }}
                />
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">No screenshot yet</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-foreground-muted mb-2 font-medium uppercase tracking-wide">After</p>
            <div className="rounded-lg border border-border overflow-hidden bg-background-subtle aspect-video flex items-center justify-center">
              {review.afterScreenshot ? (
                <img
                  src={review.afterScreenshot}
                  alt={`${review.page} after`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    if (target.parentElement) target.parentElement.innerHTML = '<span style="color:#71717a" class="text-sm">No screenshot available</span>'
                  }}
                />
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">No screenshot yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description & Notes */}
      <div className="p-5 border-b border-border space-y-3">
        <p className="text-sm text-foreground-muted">{review.description}</p>
        {review.notes && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-500/10 dark:border-green-500/20">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Notes</p>
            <p className="text-sm text-foreground-muted">{review.notes}</p>
          </div>
        )}
      </div>

      {/* Feedback & Actions */}
      <div className="p-5">
        <div className="mb-4">
          <label className="text-xs text-foreground-muted font-medium uppercase tracking-wide block mb-2">
            Feedback
          </label>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Add feedback or notes about this design change..."
            className="w-full px-3 py-2 rounded-lg bg-background-subtle border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <button
            disabled={updating}
            onClick={() => onUpdate(review.id, { status: 'approved', feedback })}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
          >
            Approve
          </button>
          <button
            disabled={updating}
            onClick={() => onUpdate(review.id, { status: 'changes-requested', feedback })}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
          >
            Request Changes
          </button>
          {feedback !== review.feedback && (
            <button
              disabled={updating}
              onClick={() => onUpdate(review.id, { feedback })}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-surface border border-border text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
            >
              Save Feedback
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
