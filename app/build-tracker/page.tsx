'use client'

import { useState, useEffect, useCallback } from 'react'

interface CodeChange {
  file: string
  lines?: number
  action?: string
  diff?: string
}

interface QAResults {
  [key: string]: boolean | string
}

interface FeedbackItem {
  id: string
  type: string
  notes: string
  from: string
  createdAt: string
}

interface Task {
  id: string
  sprintId: string
  title: string
  description: string
  acceptanceCriteria: string[]
  agent: string
  status: string
  codeChanges: CodeChange[]
  qaStatus: string | null | { passed: boolean; results: string[] }
  qaResults?: QAResults
  feedback: FeedbackItem[]
  createdAt: string
  updatedAt: string
}

interface Sprint {
  id: string
  name: string
  startDate: string
  status: string
}

const COLUMNS = [
  { key: 'backlog', label: 'Backlog', icon: '📋', accent: 'border-slate-400 dark:border-slate-500', bg: 'bg-slate-100 dark:bg-slate-800/40', badge: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' },
  { key: 'in-progress', label: 'In Progress', icon: '⚡', accent: 'border-blue-400 dark:border-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200' },
  { key: 'in-review', label: 'In Review', icon: '👀', accent: 'border-amber-400 dark:border-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200' },
  { key: 'approved', label: 'Approved', icon: '✅', accent: 'border-green-400 dark:border-green-500', bg: 'bg-green-50 dark:bg-green-900/30', badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200' },
  { key: 'deployed', label: 'Deployed', icon: '🚀', accent: 'border-purple-400 dark:border-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200' },
]

export default function BuildTrackerPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [rejectModal, setRejectModal] = useState<{ taskId: string; open: boolean }>({ taskId: '', open: false })
  const [rejectNotes, setRejectNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/build-tracker')
      const data = await res.json()
      setTasks(data.tasks || [])
      setSprints(data.sprints || [])
    } catch (e) {
      console.error('Failed to fetch build tracker data:', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => {
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const updateStatus = async (taskId: string, status: string) => {
    await fetch('/api/build-tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-task', taskId, updates: { status } }),
    })
    fetchData()
  }

  const approveTask = async (taskId: string) => {
    await fetch('/api/build-tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', taskId }),
    })
    fetchData()
  }

  const rejectTask = async () => {
    await fetch('/api/build-tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', taskId: rejectModal.taskId, notes: rejectNotes }),
    })
    setRejectModal({ taskId: '', open: false })
    setRejectNotes('')
    fetchData()
  }

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const activeSprint = sprints.find(s => s.status === 'active')
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'approved' || t.status === 'deployed').length
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-foreground-muted animate-pulse text-lg">Loading Build Tracker...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
      {/* Sprint Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">🔨 Build Tracker</h1>
            {activeSprint && (
              <p className="text-foreground-muted">
                {activeSprint.name} · Started {new Date(activeSprint.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-background-subtle rounded-lg p-1">
              <button
                onClick={() => setViewMode('board')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'board' ? 'bg-surface text-foreground' : 'text-foreground-muted hover:text-foreground'}`}
              >
                Board
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'list' ? 'bg-surface text-foreground' : 'text-foreground-muted hover:text-foreground'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-background-subtle border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground-muted">Sprint Progress</span>
            <span className="text-sm font-mono text-foreground">{completedTasks}/{totalTasks} tasks · {progressPct}%</span>
          </div>
          <div className="h-2.5 bg-background-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#f97316] to-[#f97316]/70 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3">
            {COLUMNS.map(col => {
              const count = tasks.filter(t => t.status === col.key).length
              return count > 0 ? (
                <span key={col.key} className={`text-xs px-2 py-1 rounded-full ${col.badge}`}>
                  {col.icon} {count} {col.label.toLowerCase()}
                </span>
              ) : null
            })}
          </div>
        </div>
      </div>

      {/* Board View */}
      {viewMode === 'board' ? (
        <div className="flex gap-5 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key)
            return (
              <div key={col.key} className="flex-shrink-0 w-80">
                {/* Column Header */}
                <div className={`border-t-3 ${col.accent} ${col.bg} rounded-xl p-4 mb-4`} style={{ borderTopWidth: '3px' }}>
                  <div className="flex justify-between items-center">
                    <h2 className="font-bold text-base flex items-center gap-2">
                      <span>{col.icon}</span>
                      {col.label}
                    </h2>
                    <span className={`text-xs font-mono rounded-full px-2.5 py-1 ${col.badge}`}>
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Task Cards */}
                <div className="space-y-4">
                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-foreground-muted text-sm border border-dashed border-border rounded-xl">
                      No tasks
                    </div>
                  )}
                  {colTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      expanded={expandedCards.has(task.id)}
                      onToggleExpand={() => toggleExpand(task.id)}
                      onApprove={() => approveTask(task.id)}
                      onReject={() => setRejectModal({ taskId: task.id, open: true })}
                      onUpdateStatus={(s) => updateStatus(task.id, s)}
                      columnKey={col.key}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {tasks.map(task => {
            const col = COLUMNS.find(c => c.key === task.status)
            return (
              <div key={task.id} className="bg-background-subtle border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${col?.badge || ''}`}>
                        {col?.icon} {col?.label}
                      </span>
                      <span className="text-xs bg-[#f97316]/20 text-[#f97316] px-2.5 py-1 rounded-full font-medium">
                        {task.agent}
                      </span>
                      {task.qaResults && (
                        <span className="text-xs text-green-400">✅ QA Passed</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-base mb-1">{task.title}</h3>
                    <p className="text-sm text-foreground-muted">{task.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {task.status === 'in-review' && (
                      <>
                        <button onClick={() => approveTask(task.id)} className="px-4 py-2 text-sm rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 font-medium">
                          ✓ Approve
                        </button>
                        <button onClick={() => setRejectModal({ taskId: task.id, open: true })} className="px-4 py-2 text-sm rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 font-medium">
                          ✗ Changes
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setRejectModal({ taskId: '', open: false })}>
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">📝 Request Changes</h3>
            <textarea
              className="w-full bg-secondary border border-border rounded-xl p-4 text-sm min-h-[140px] focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/20 placeholder-foreground-subtle"
              placeholder="Describe what needs to change..."
              value={rejectNotes}
              onChange={e => setRejectNotes(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3 mt-5 justify-end">
              <button
                onClick={() => setRejectModal({ taskId: '', open: false })}
                className="px-5 py-2.5 text-sm rounded-xl border border-border hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={rejectTask}
                disabled={!rejectNotes.trim()}
                className="px-5 py-2.5 text-sm rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Send Back to Billy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, expanded, onToggleExpand, onApprove, onReject, onUpdateStatus, columnKey }: {
  task: Task
  expanded: boolean
  onToggleExpand: () => void
  onApprove: () => void
  onReject: () => void
  onUpdateStatus: (status: string) => void
  columnKey: string
}) {
  const nextStatus: Record<string, string> = {
    'backlog': 'in-progress',
    'in-progress': 'in-review',
    'approved': 'deployed',
  }

  const qaResults = task.qaResults as QAResults | undefined
  const hasQA = qaResults && Object.keys(qaResults).length > 0
  const commitHash = qaResults?.commitHash as string | undefined

  return (
    <div className="bg-surface border-border border border-border rounded-xl p-5 hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-[#f97316]/5">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-[15px] leading-snug pr-2">{task.title}</h3>
        <span className="text-xs bg-[#f97316]/20 text-[#f97316] px-2.5 py-1 rounded-full flex-shrink-0 font-medium">
          {task.agent}
        </span>
      </div>

      <p className="text-sm text-foreground-muted mb-4 leading-relaxed">{task.description}</p>

      {/* QA Badge */}
      {hasQA && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-400 font-medium mb-2">
            ✅ QA Passed
            {commitHash && <span className="text-xs font-mono text-foreground-muted">({commitHash})</span>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(qaResults).filter(([k]) => k !== 'commitHash').map(([key, val]) => (
              <span key={key} className={`text-[11px] px-2 py-0.5 rounded-full ${val ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                {val ? '✓' : '✗'} {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      {task.feedback?.length > 0 && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <span className="text-xs text-red-400 font-semibold">⚠️ Change Requested:</span>
          <p className="text-sm text-foreground-muted mt-1">{task.feedback[task.feedback.length - 1].notes}</p>
        </div>
      )}

      {/* Expandable Details */}
      <button onClick={onToggleExpand} className="text-sm text-foreground-muted hover:text-foreground transition-colors flex items-center gap-1.5 mb-3">
        <span className="text-xs">{expanded ? '▾' : '▸'}</span>
        {expanded ? 'Hide' : 'Show'} details
      </button>

      {expanded && (
        <div className="space-y-4 mb-4 pl-1">
          {/* Acceptance Criteria */}
          <div>
            <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">Acceptance Criteria</p>
            <ul className="space-y-1.5">
              {task.acceptanceCriteria.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                  <span className="text-foreground-subtle mt-0.5">
                    {hasQA ? '✅' : '○'}
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Code Changes */}
          {task.codeChanges?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">Files Changed</p>
              <div className="space-y-1">
                {task.codeChanges.map((change, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-mono">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      change.action === 'created' ? 'bg-green-500/20 text-green-400' :
                      change.action === 'modified' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {change.action === 'created' ? '+' : change.action === 'modified' ? '~' : '?'}
                    </span>
                    <span className="text-[#f97316]">{change.file}</span>
                    {change.lines && <span className="text-foreground-subtle text-xs">({change.lines} lines)</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <p className="text-xs text-foreground-subtle">
            Created {new Date(task.createdAt).toLocaleString()} · Updated {new Date(task.updatedAt).toLocaleString()}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-white/5">
        {columnKey === 'in-review' && (
          <>
            <button onClick={onApprove} className="flex-1 text-sm py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 font-medium transition-colors">
              ✓ Approve
            </button>
            <button onClick={onReject} className="flex-1 text-sm py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 font-medium transition-colors">
              ✗ Changes
            </button>
          </>
        )}
        {nextStatus[columnKey] && (
          <button
            onClick={() => onUpdateStatus(nextStatus[columnKey])}
            className="flex-1 text-sm py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-border transition-colors"
          >
            Move → {COLUMNS.find(c => c.key === nextStatus[columnKey])?.label}
          </button>
        )}
        {columnKey === 'deployed' && (
          <div className="flex-1 text-center text-sm py-2 text-green-400/50">
            🚀 Shipped
          </div>
        )}
      </div>
    </div>
  )
}
