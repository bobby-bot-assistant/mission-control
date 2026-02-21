'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Feature {
  name: string
  status: 'planned' | 'in-progress' | 'completed'
  priority: 'must-have' | 'nice-to-have'
  builtBy: string
  note?: string
}

interface Blocker {
  title: string
  owner: string
  description: string
}

interface MVP {
  id: string
  title: string
  stage: string
  progress: number
  liveUrl?: string
  features: Feature[]
  blockers: Blocker[]
  nextUp: string[]
}

export default function MVPDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [mvp, setMVP] = useState<MVP | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMVP = async () => {
      if (!params.id) return
      
      try {
        const res = await fetch(`/api/pipeline/mvps/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setMVP(data)
        } else {
          setError('MVP not found')
        }
      } catch (e) {
        console.error('Failed to load MVP:', e)
        setError('Failed to load MVP data')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadMVP()
  }, [params.id])

  const handleMoveToLive = async () => {
    if (!mvp) return
    
    try {
      // Log transition to queue
      await fetch('/api/pipeline/transitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: mvp.id,
          itemTitle: mvp.title,
          fromStage: 'mvp',
          toStage: 'live',
          action: 'move_to_live'
        })
      })
      
      alert('Move to Live request submitted! Bobby will review and approve.')
    } catch (e) {
      console.error('Failed to submit transition:', e)
      alert('Failed to submit transition')
    }
  }

  const handleRequestChanges = () => {
    alert('Change request feature coming soon!')
  }

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-background-subtle rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-background-subtle rounded w-1/2 mb-2"></div>
          <div className="h-32 bg-background-subtle rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (error || !mvp) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/pipeline')}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Pipeline
        </button>
        <p className="text-foreground-muted">{error || 'MVP not found'}</p>
      </div>
    )
  }

  const stageColors: Record<string, string> = {
    planning: 'bg-blue-500',
    building: 'bg-amber-500',
    testing: 'bg-purple-500',
    launched: 'bg-green-500',
    mvp: 'bg-orange-500'
  }

  const statusIcons: Record<string, string> = {
    completed: '✅',
    'in-progress': '🔧',
    planned: '📋'
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/pipeline')}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Pipeline
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{mvp.title}</h1>
            {mvp.liveUrl && (
              <a 
                href={mvp.liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1"
              >
                🔗 {mvp.liveUrl}
              </a>
            )}
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${stageColors[mvp.stage] || 'bg-gray-500'} text-white`}>
            {mvp.stage.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-foreground-muted">{mvp.progress}%</span>
        </div>
        <div className="w-full bg-background-subtle rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${mvp.progress}%` }}
          />
        </div>
      </div>

      {/* Section 1: What's Built */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">🔨 What's Built</h2>
        <div className="space-y-3">
          {mvp.features.map((feature, i) => (
            <div key={i} className="flex items-start justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{statusIcons[feature.status] || '📋'}</span>
                <div>
                  <div className="font-medium">{feature.name}</div>
                  <div className="text-xs text-foreground-muted">Built by: {feature.builtBy}</div>
                  {feature.note && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">{feature.note}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {feature.priority === 'must-have' && (
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">
                    MUST HAVE
                  </span>
                )}
                <span className="text-sm text-foreground-muted capitalize">
                  {feature.status.replace('-', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Current Blockers */}
      {mvp.blockers && mvp.blockers.length > 0 && (
        <div className="bg-surface border border-red-500/30 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🚧 Current Blockers</h2>
          <div className="space-y-4">
            {mvp.blockers.map((blocker, i) => (
              <div key={i} className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="font-medium text-red-400">{blocker.title}</div>
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                    Owner: {blocker.owner}
                  </span>
                </div>
                <div className="text-sm text-foreground-muted mt-2">{blocker.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: What's Next */}
      {mvp.nextUp && mvp.nextUp.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📌 What's Next</h2>
          <div className="space-y-2">
            {mvp.nextUp.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <span className="text-foreground-muted">{i + 1}.</span>
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleRequestChanges}
          className="flex-1 px-4 py-3 bg-warning text-white rounded-lg hover:opacity-90 font-medium"
        >
          🔄 Request Changes
        </button>
        <button
          onClick={handleMoveToLive}
          className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:opacity-90 font-medium"
        >
          🚀 Move to Live (for Bobby)
        </button>
      </div>
    </div>
  )
}
