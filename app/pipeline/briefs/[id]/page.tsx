'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface IdeaBrief {
  id: string
  title: string
  sections: Array<{ title: string; content: string }>
  rawMarkdown: string
  createdAt: string
  updatedAt: string
  status: 'pending' | 'approved' | 'changes-requested' | 'archived'
}

export default function IdeaBriefPage() {
  const router = useRouter()
  const params = useParams()
  const briefId = params.id as string
  
  const [brief, setBrief] = useState<IdeaBrief | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [submittedFeedback, setSubmittedFeedback] = useState('')
  const [approveMessage, setApproveMessage] = useState('')

  useEffect(() => {
    loadBrief()
  }, [briefId])

  const loadBrief = async () => {
    try {
      const res = await fetch(`/api/pipeline/briefs/${briefId}`)
      if (res.ok) {
        const data = await res.json()
        setBrief(data)
      }
    } catch (error) {
      console.error('Failed to load brief:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDecision = async (decision: 'approve' | 'changes' | 'archive') => {
    // First click on "Request Changes" - show textarea
    if (decision === 'changes' && !showFeedback && !feedback && !submittedFeedback) {
      setShowFeedback(true)
      return
    }
    
    // Submit changes with feedback
    if (decision === 'changes' && feedback.trim()) {
      try {
        const res = await fetch('/api/pipeline/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            briefId,
            feedback: feedback.trim(),
            requestedBy: 'bobby',
            timestamp: new Date().toISOString()
          })
        })
        
        if (res.ok) {
          // Update local state
          setBrief(prev => prev ? { ...prev, status: 'changes-requested' } : null)
          setSubmittedFeedback(feedback)
          setShowConfirmation(true)
          setShowFeedback(true)
          setFeedback('')
        }
      } catch (error) {
        console.error('Failed to submit feedback:', error)
      }
      return
    }
    
    // Continue with approve or archive
    try {
      if (decision === 'approve') {
        const res = await fetch('/api/pipeline/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ briefId, status: 'approved' })
        })
        if (res.ok) {
          setBrief(prev => prev ? { ...prev, status: 'approved' } : null)
          setApproveMessage('PRD process started — team is researching')
          
          // Log transition to queue
          try {
            await fetch('/api/pipeline/transitions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                itemId: briefId,
                itemTitle: brief?.title || '',
                fromStage: 'idea',
                toStage: 'prd',
                action: 'approve_build_prd'
              })
            })
          } catch (e) {
            console.error('Failed to log transition:', e)
          }
        }
        return
      }
      
      // Update brief status
      setBrief(prev => prev ? { ...prev, status: decision === 'changes' ? 'changes-requested' : 'archived' } : null)
      
      if (decision === 'changes') {
        // Just show textarea (first click)
        setShowFeedback(true)
      } else {
        // Archive and go back to pipeline
        router.push('/pipeline')
      }
    } catch (error) {
      console.error('Failed to update decision:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-background-subtle rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-background-subtle rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-background-subtle rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!brief) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <p className="text-foreground-muted">Brief not found</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <button 
            onClick={() => router.push('/pipeline')}
            className="text-foreground-subtle hover:text-foreground-muted"
          >
            ← Back to Pipeline
          </button>
        </div>
        <h1 className="text-3xl font-bold mb-2">💡 Idea Brief</h1>
        <p className="text-xl text-foreground-muted">{brief.title}</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Brief */}
        <div className="lg:col-span-2 space-y-6">
          {brief.sections.map((section, idx) => (
            <div key={idx} className="bg-surface border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-3">{section.title}</h3>
              <div className="text-foreground-muted prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column - Decisions */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Your Decision</h3>
            
            {/* Approve Confirmation */}
            {approveMessage && (
              <div className="mb-4 p-3 bg-success/20 border border-success/40 rounded-lg text-sm">
                ✅ {approveMessage}
              </div>
            )}
            
            {/* Confirmation Banner */}
            {showConfirmation && (
              <div className="mb-4 p-3 bg-success/20 border border-success/40 rounded-lg text-sm">
                ✅ Changes requested — River will relay this to the team
              </div>
            )}
            
            {showFeedback && (
              <div className="mb-4">
                {submittedFeedback ? (
                  <div className="p-3 bg-background border border-border rounded-lg text-sm text-foreground-muted">
                    <div className="font-medium mb-1">Submitted feedback:</div>
                    {submittedFeedback}
                  </div>
                ) : (
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="What changes do you need?"
                    className="w-full p-3 bg-background border border-border rounded-lg text-sm"
                    rows={3}
                  />
                )}
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => handleDecision('approve')}
                className="w-full px-4 py-3 bg-success text-white rounded-lg hover:opacity-90 font-medium"
                disabled={brief.status !== 'pending'}
              >
                ✅ Approve & Build PRD
              </button>
              
              <button
                onClick={() => handleDecision('changes')}
                className="w-full px-4 py-3 bg-warning text-white rounded-lg hover:opacity-90 font-medium"
              >
                {showFeedback && (feedback.trim() || submittedFeedback) ? '✅ Submit Changes' : '🔄 Request Changes'}
              </button>
              
              <button
                onClick={() => handleDecision('archive')}
                className="w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 font-medium"
              >
                ❌ Archive
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}