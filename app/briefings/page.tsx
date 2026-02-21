'use client'

import { useState, useEffect } from 'react'

interface Signal {
  id: string
  title: string
  description: string
  stars: number
  urgent: boolean
  status: string
  decided_at?: string
}

interface Briefing {
  id: string
  _file: string
  date: string
  source: string
  title: string
  recommendation: string
  signals: Signal[]
  created_at: string
}

const statusColors: Record<string, string> = {
  new: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300',
  approved: 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-600/20 dark:text-green-400 dark:border-green-500/30',
  parked: 'bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-600/20 dark:text-yellow-400 dark:border-yellow-500/30',
  rejected: 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-600/20 dark:text-red-400 dark:border-red-500/30',
}

const statusLabels: Record<string, string> = {
  new: 'New',
  approved: '✅ Approved',
  parked: '⏸️ Parked',
  rejected: '❌ Rejected',
}

export default function BriefingsPage() {
  const [briefings, setBriefings] = useState<Briefing[]>([])
  const [expandedBriefing, setExpandedBriefing] = useState<string | null>(null)
  const [expandedSignals, setExpandedSignals] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/briefings')
      .then(r => r.json())
      .then(data => {
        setBriefings(Array.isArray(data) ? data : [])
        if (data.length > 0) setExpandedBriefing(data[0].id)
        setLoading(false)
      })
  }, [])

  const toggleSignal = (key: string) => {
    setExpandedSignals(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const updateStatus = async (briefing: Briefing, signalId: string, status: string) => {
    const res = await fetch('/api/briefings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId: briefing._file, signalId, status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setBriefings(prev =>
        prev.map(b => (b.id === briefing.id ? { ...updated, _file: briefing._file } : b))
      )
    }
  }

  const stars = (n: number) => '⭐'.repeat(n) + '☆'.repeat(5 - n)

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto text-foreground-muted">Loading briefings...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">🔍 Briefings</h1>
          <p className="text-foreground-muted text-sm mt-1">
            Intelligence briefings with signal analysis and Go/No-Go decisions
          </p>
        </div>

        {briefings.length === 0 && (
          <div className="bg-surface border border-border rounded-lg p-8 text-center text-foreground-muted">
            No briefings yet. Add JSON files to the briefings data directory.
          </div>
        )}

        <div className="space-y-4">
          {briefings.map(briefing => {
            const isExpanded = expandedBriefing === briefing.id
            const urgentCount = briefing.signals.filter(s => s.urgent).length
            const newCount = briefing.signals.filter(s => s.status === 'new').length

            return (
              <div key={briefing.id} className="bg-surface border border-border rounded-xl overflow-hidden">
                {/* Briefing Header */}
                <button
                  onClick={() => setExpandedBriefing(isExpanded ? null : briefing.id)}
                  className="w-full text-left p-5 hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-foreground-muted text-sm font-mono">{briefing.date}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-300 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30">
                          {briefing.source}
                        </span>
                        {urgentCount > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30">
                            🔥 {urgentCount} urgent
                          </span>
                        )}
                        {newCount > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30">
                            {newCount} pending
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold">{briefing.title}</h2>
                    </div>
                    <span className="text-foreground-muted text-lg">{isExpanded ? '▼' : '▶'}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border">
                    {/* Recommendation */}
                    <div className="p-4 mx-5 my-4 rounded-lg bg-orange-50 border border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20">
                      <p className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-1">💡 Daisy&apos;s Recommendation</p>
                      <p className="text-sm text-foreground-muted">{briefing.recommendation}</p>
                    </div>

                    {/* Signals */}
                    <div className="px-5 pb-5 space-y-3">
                      {briefing.signals.map(signal => {
                        const sigKey = `${briefing.id}:${signal.id}`
                        const sigExpanded = expandedSignals.has(sigKey)

                        return (
                          <div
                            key={signal.id}
                            className={`rounded-lg border ${
                              signal.urgent
                                ? 'border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/5'
                                : 'border-border bg-background-subtle'
                            }`}
                          >
                            <button
                              onClick={() => toggleSignal(sigKey)}
                              className="w-full text-left p-4 flex items-start justify-between gap-3"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  {signal.urgent && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 font-semibold">
                                      🔥 URGENT
                                    </span>
                                  )}
                                  <span className="font-medium">{signal.title}</span>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      statusColors[signal.status] || statusColors.new
                                    }`}
                                  >
                                    {statusLabels[signal.status] || signal.status}
                                  </span>
                                </div>
                                <div className="text-xs text-foreground-muted">
                                  {stars(signal.stars)}
                                </div>
                              </div>
                              <span className="text-foreground-muted text-sm mt-1">
                                {sigExpanded ? '▼' : '▶'}
                              </span>
                            </button>

                            {sigExpanded && (
                              <div className="px-4 pb-4 border-t border-border/50">
                                <p className="text-sm text-foreground-muted mt-3 mb-4">
                                  {signal.description}
                                </p>
                                {signal.status === 'new' && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => updateStatus(briefing, signal.id, 'approved')}
                                      className="px-4 py-1.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                                    >
                                      ✅ Approve
                                    </button>
                                    <button
                                      onClick={() => updateStatus(briefing, signal.id, 'parked')}
                                      className="px-4 py-1.5 rounded-lg text-sm font-medium bg-yellow-600 hover:bg-yellow-700 text-white transition-colors"
                                    >
                                      ⏸️ Park
                                    </button>
                                    <button
                                      onClick={() => updateStatus(briefing, signal.id, 'rejected')}
                                      className="px-4 py-1.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                                    >
                                      ❌ Reject
                                    </button>
                                  </div>
                                )}
                                {signal.status !== 'new' && signal.decided_at && (
                                  <p className="text-xs text-foreground-muted">
                                    Decided {new Date(signal.decided_at).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
