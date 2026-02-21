'use client'

import { useEffect, useState } from 'react'

interface SprintMetrics {
  lastUpdated: string
  currentSprint: {
    id: string
    name: string
    startDate: string
    totalTasks: number
    completedTasks: number
    inProgress: number
    blocked: number
    velocity: number
    estimatedCompletion: string
  } | null
  previousSprints: Array<{
    id: string
    name: string
    totalTasks: number
    completedTasks: number
    velocity: number
    durationDays: number
  }>
  buildFrequency: {
    last7Days: number
    last30Days: number
    avgPerDay: number
  }
  contentOutput: {
    postsCreated: number
    postsSent: number
    blogDrafts: number
    videoScripts: number
    approvalsPending: number
    approvalsResolved: number
  }
  agentActivity: Record<string, Record<string, number>>
  milestones: Array<{
    date: string
    label: string
    type: string
  }>
}

function ProgressBar({ value, max, color = 'bg-blue-500' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="w-full bg-background-subtle rounded-full h-3 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function StatCard({ label, value, subtitle, color = 'text-foreground' }: { label: string; value: string | number; subtitle?: string; color?: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {subtitle && <p className="text-xs text-foreground-subtle mt-1">{subtitle}</p>}
    </div>
  )
}

export default function InsightsPage() {
  const [metrics, setMetrics] = useState<SprintMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sprint-metrics')
      .then(r => r.json())
      .then(setMetrics)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-foreground-muted">Loading insights...</div>
  if (!metrics) return <div className="p-8 text-foreground-muted">No metrics data available.</div>

  const sprint = metrics.currentSprint
  const sprintPct = sprint ? Math.round((sprint.completedTasks / sprint.totalTasks) * 100) : 0
  const agentNames: Record<string, { emoji: string; name: string }> = {
    daisy: { emoji: '🌼', name: 'Daisy' },
    billy: { emoji: '🔨', name: 'Billy' },
    scout: { emoji: '🔭', name: 'Scout' },
    kobe: { emoji: '✍️', name: 'Kobe' },
    harper: { emoji: '🔍', name: 'Harper' },
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📊 Insights Dashboard</h1>
        <p className="text-foreground-muted">Real-time sprint performance, content output, and build activity</p>
        {metrics.lastUpdated && (
          <p className="text-xs text-foreground-subtle mt-1">Last updated: {new Date(metrics.lastUpdated).toLocaleString()}</p>
        )}
      </div>

      {/* Sprint Progress */}
      {sprint && (
        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">{sprint.name}</h2>
              <p className="text-sm text-foreground-muted">Started {sprint.startDate} · Est. completion {sprint.estimatedCompletion}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-blue-400">{sprintPct}%</span>
              <p className="text-xs text-foreground-subtle">{sprint.completedTasks}/{sprint.totalTasks} tasks</p>
            </div>
          </div>
          <ProgressBar value={sprint.completedTasks} max={sprint.totalTasks} color="bg-blue-500" />
          <div className="flex gap-6 mt-4 text-sm">
            <span className="text-green-400">✅ {sprint.completedTasks} complete</span>
            <span className="text-blue-400">🔵 {sprint.inProgress} in progress</span>
            {sprint.blocked > 0 && <span className="text-red-400">🔴 {sprint.blocked} blocked</span>}
            <span className="text-foreground-subtle">Velocity: {sprint.velocity} tasks/day</span>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Builds (7 days)" value={metrics.buildFrequency.last7Days} subtitle={`${metrics.buildFrequency.avgPerDay}/day avg`} color="text-green-400" />
        <StatCard label="Content Created" value={metrics.contentOutput.postsCreated} subtitle={`${metrics.contentOutput.postsSent} sent`} color="text-blue-400" />
        <StatCard label="Sprint Velocity" value={sprint?.velocity || 0} subtitle="tasks/day" color="text-amber-400" />
        <StatCard label="Sprints Completed" value={metrics.previousSprints.length} subtitle={`${metrics.previousSprints.reduce((sum, s) => sum + s.completedTasks, 0)} total tasks`} color="text-purple-400" />
      </div>

      {/* Agent Activity */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">🤖 Agent Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(metrics.agentActivity).map(([agent, stats]) => {
            const info = agentNames[agent] || { emoji: '🤖', name: agent }
            return (
              <div key={agent} className="bg-background-subtle rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{info.emoji}</span>
                  <span className="font-semibold">{info.name}</span>
                </div>
                <div className="space-y-1">
                  {Object.entries(stats).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-foreground-muted">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-medium text-foreground">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Content Pipeline */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">📝 Content Pipeline</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-background-subtle rounded-lg">
            <div className="text-2xl font-bold text-amber-400">{metrics.contentOutput.postsCreated}</div>
            <div className="text-xs text-foreground-subtle mt-1">Posts Created</div>
          </div>
          <div className="text-center p-4 bg-background-subtle rounded-lg">
            <div className="text-2xl font-bold text-green-400">{metrics.contentOutput.postsSent}</div>
            <div className="text-xs text-foreground-subtle mt-1">Posts Sent</div>
          </div>
          <div className="text-center p-4 bg-background-subtle rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{metrics.contentOutput.blogDrafts}</div>
            <div className="text-xs text-foreground-subtle mt-1">Blog Drafts</div>
          </div>
          <div className="text-center p-4 bg-background-subtle rounded-lg">
            <div className="text-2xl font-bold text-pink-400">{metrics.contentOutput.videoScripts}</div>
            <div className="text-xs text-foreground-subtle mt-1">Video Scripts</div>
          </div>
        </div>
      </div>

      {/* Milestones Timeline */}
      {metrics.milestones.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">🏁 Milestones</h2>
          <div className="space-y-3">
            {metrics.milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.type === 'achievement' ? 'bg-green-400' : m.type === 'decision' ? 'bg-blue-400' : 'bg-amber-400'}`} />
                <span className="text-xs text-foreground-subtle w-24 flex-shrink-0">{m.date}</span>
                <span className="text-sm text-foreground">{m.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${m.type === 'achievement' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {m.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Previous Sprints */}
      {metrics.previousSprints.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">📦 Completed Sprints</h2>
          <div className="space-y-3">
            {metrics.previousSprints.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-background-subtle rounded-lg">
                <div>
                  <span className="font-medium text-sm">{s.name}</span>
                  <span className="text-xs text-foreground-subtle ml-3">{s.durationDays} day{s.durationDays !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-green-400">{s.completedTasks}/{s.totalTasks} tasks</span>
                  <span className="text-foreground-subtle">v={s.velocity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
