'use client'

import { useEffect, useState } from 'react'

interface Agent {
  name: string
  model: string
  status: 'active' | 'idle' | 'dormant' | 'error'
  lastActivity: string | null
  task: string | null
}

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  idle: '#eab308',
  dormant: '#6b7280',
  error: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  idle: 'Idle',
  dormant: 'Dormant',
  error: 'Error',
}

export default function AgentStudioPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then(data => { setAgents(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const counts = {
    active: agents.filter(a => a.status === 'active').length,
    idle: agents.filter(a => a.status === 'idle').length,
    dormant: agents.filter(a => a.status === 'dormant').length,
    error: agents.filter(a => a.status === 'error').length,
  }

  return (
    <div className="p-8 overflow-y-auto h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">🤖 Agent Studio</h1>
        <p className="text-foreground-subtle text-sm">
          {agents.length} agents — {counts.active} active, {counts.idle} idle, {counts.dormant} dormant{counts.error > 0 ? `, ${counts.error} error` : ''}
        </p>
      </div>

      {loading ? (
        <p className="text-foreground-subtle">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agents.map(agent => (
            <div
              key={agent.name}
              className="bg-surface border border-border rounded-lg p-4 hover:border-foreground-subtle transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{agent.name}</h3>
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[agent.status] + '20', color: STATUS_COLORS[agent.status] }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[agent.status] }}
                  />
                  {STATUS_LABELS[agent.status]}
                </span>
              </div>
              <p className="text-foreground-subtle text-sm mb-2">{agent.model}</p>
              {agent.task && (
                <p className="text-sm text-foreground-muted truncate mb-1" title={agent.task}>
                  📋 {agent.task}
                </p>
              )}
              {agent.lastActivity && (
                <p className="text-xs text-foreground-subtle">
                  Last active: {new Date(agent.lastActivity).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
