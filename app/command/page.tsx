'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// Token meter removed per Bobby's directive (2026-02-07)

interface MissionStat {
  label: string
  value: string | number
  change?: number
  unit?: string
}

interface Decision {
  id: string
  title: string
  type: 'strategic' | 'operational' | 'tactical'
  urgency: 'critical' | 'high' | 'medium' | 'low'
  sdsScore?: number
  status: 'pending' | 'made' | 'deferred'
  createdAt: string
}

interface ActiveProject {
  id: string
  title: string
  progress: number
  status: 'on-track' | 'at-risk' | 'blocked'
  nextMilestone: string
  daysUntil: number
}

export default function CommandPage() {
  const router = useRouter()
  const [missionStats, setMissionStats] = useState<MissionStat[]>([])
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([])
  const [selectedView, setSelectedView] = useState<'overview' | 'decisions' | 'analysis'>('overview')
  // tokenUsage removed

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    // Mission Stats
    setMissionStats([
      { label: 'Pipeline Velocity', value: 4.5, unit: 'ideas/week', change: 40 },
      { label: 'Content Published', value: 8, unit: 'this week', change: 60 },
      { label: 'Active Opportunities', value: 5, change: -28 },
      { label: 'Days to Revenue', value: 38, change: -10 },
    ])

    // Pending Decisions
    setDecisions([
      // No pending decisions at this time
    ])

    // Active Projects
    setActiveProjects([
      {
        id: 'story-hour-simon',
        title: 'Story Hour with Simon',
        progress: 85,
        status: 'on-track',
        nextMilestone: 'Launch to beta users',
        daysUntil: 3
      },
      {
        id: 'cms-creator-tool',
        title: 'CMS Creator Tool',
        progress: 90,
        status: 'on-track',
        nextMilestone: 'Beta release',
        daysUntil: 2
      },
      {
        id: 'advisory-practice',
        title: 'Advisory Practice',
        progress: 40,
        status: 'on-track',
        nextMilestone: 'First client onboarding',
        daysUntil: 14
      },
      {
        id: 'sprint-35',
        title: 'Sprint 3.5 — Build & QA',
        progress: 75,
        status: 'on-track',
        nextMilestone: 'Sprint complete',
        daysUntil: 1
      }
    ])
  }

  const getUrgencyColor = (urgency: Decision['urgency']) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 dark:text-red-400'
      case 'high': return 'text-orange-600 dark:text-orange-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      default: return 'text-green-600 dark:text-green-400'
    }
  }

  const getStatusColor = (status: ActiveProject['status']) => {
    switch (status) {
      case 'on-track': return 'bg-green-500'
      case 'at-risk': return 'bg-yellow-500'
      case 'blocked': return 'bg-red-500'
    }
  }

  const formatTimeAgo = (isoString: string) => {
    const now = Date.now()
    const then = new Date(isoString).getTime()
    const diff = now - then
    
    const hours = Math.floor(diff / (60 * 60 * 1000))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    return `${hours}h ago`
  }

  // token meter variables removed

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">🎯 Command Center</h1>
            <p className="text-foreground-muted">Executive overview and critical decisions</p>
          </div>
          
          {/* Quick Status */}
          <div className="bg-surface border border-border rounded-lg p-4 w-48">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground-muted">Daisy Status</span>
              <span className="text-xs text-green-500">● Online</span>
            </div>
            <div className="text-xs text-foreground-subtle space-y-1">
              <div>Model: Opus 4.6</div>
              <div>Team: 10 agents configured</div>
              <div>Mode: Autonomous</div>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedView('overview')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedView === 'overview'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:opacity-90'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedView('decisions')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedView === 'decisions'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:opacity-90'
          }`}
        >
          Decisions ({decisions.filter(d => d.status === 'pending').length})
        </button>
        <button
          onClick={() => setSelectedView('analysis')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedView === 'analysis'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:opacity-90'
          }`}
        >
          Analysis
        </button>
      </div>

      {/* Overview View */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Mission Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {missionStats.map((stat, idx) => (
              <div key={idx} className="bg-surface border border-border rounded-lg p-6">
                <p className="text-sm text-foreground-muted mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  {stat.unit && <span className="text-sm text-foreground-muted">{stat.unit}</span>}
                </div>
                {stat.change && (
                  <p className={`text-sm mt-2 ${stat.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Active Projects */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Active Projects</h2>
            <div className="space-y-4">
              {activeProjects.map(project => (
                <div key={project.id} className="bg-background rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-foreground-muted">
                        Next: {project.nextMilestone} ({project.daysUntil}d)
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(project.status)}`}>
                      {project.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="relative h-2 bg-background-subtle rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full ${getStatusColor(project.status)}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-foreground-subtle mt-1">{project.progress}% complete</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Decisions */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Pending Decisions</h2>
              <button
                onClick={() => setSelectedView('decisions')}
                className="text-sm text-primary hover:underline"
              >
                View all →
              </button>
            </div>
            <div className="space-y-3">
              {decisions
                .filter(d => d.status === 'pending')
                .slice(0, 3)
                .map(decision => (
                  <div
                    key={decision.id}
                    className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => router.push('/analysis')}
                  >
                    <div>
                      <h4 className="font-medium">{decision.title}</h4>
                      <div className="flex items-center gap-3 text-sm">
                        <span className={getUrgencyColor(decision.urgency)}>
                          {decision.urgency} urgency
                        </span>
                        {decision.sdsScore && (
                          <span className="text-foreground-muted">
                            SDS: {decision.sdsScore}
                          </span>
                        )}
                        <span className="text-foreground-muted">
                          {formatTimeAgo(decision.createdAt)}
                        </span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Decisions View */}
      {selectedView === 'decisions' && (
        <div className="space-y-4">
          {decisions
            .filter(d => d.status === 'pending')
            .map(decision => (
              <div
                key={decision.id}
                className="bg-surface border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  if (decision.id === 'infant-health') {
                    router.push('/pipeline/briefs/infant-mental-health')
                  }
                  // Add specific routing for other decisions as needed
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{decision.title}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="capitalize">{decision.type} decision</span>
                      <span className={getUrgencyColor(decision.urgency)}>
                        {decision.urgency} urgency
                      </span>
                      {decision.sdsScore && (
                        <span className="font-medium">SDS: {decision.sdsScore}</span>
                      )}
                      <span className="text-foreground-muted">
                        {formatTimeAgo(decision.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                    Review →
                  </button>
                </div>
              </div>
            ))}

          {decisions.filter(d => d.status === 'pending').length === 0 && (
            <div className="text-center py-12 text-foreground-muted">
              <p>No pending decisions</p>
            </div>
          )}
        </div>
      )}

      {/* Analysis View */}
      {selectedView === 'analysis' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Decision Analysis</h2>
            <p className="text-foreground-muted mb-4">
              I analyze options and present recommendations based on the SDS framework.
            </p>
            
            {/* Recent Analyses */}
            <div className="space-y-4">
              <div className="bg-background rounded-lg p-4">
                <p className="text-sm text-foreground-muted text-center py-8">
                  No recent analyses. When critical decisions need evaluation, I'll analyze options and present recommendations based on the SDS framework.
                </p>
                <button
                  onClick={() => router.push('/analysis')}
                  className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  View Analysis Center →
                </button>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-3">Analysis History</h3>
            <p className="text-sm text-foreground-muted">
              Track whether recommendations were followed and outcomes.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}