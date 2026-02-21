'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

interface PRD {
  id: string
  title: string
  sdsScore: number
  status: 'draft' | 'review' | 'approved' | 'in-development'
  lastUpdated: string
  content: string
}

export default function PRDDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [prd, setPRD] = useState<PRD | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')

  useEffect(() => {
    loadPRD()
  }, [params.id])

  const handleMoveToMVP = async () => {
    // Update pipeline state to move to MVP
    const pipelineResponse = await fetch('/api/pipeline-state')
    if (pipelineResponse.ok) {
      const data = await pipelineResponse.json()
      if (data.items[params.id as string]) {
        data.items[params.id as string].stage = 'mvp'
        data.items[params.id as string].lastUpdated = new Date().toISOString()
        
        await fetch('/api/pipeline-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        router.push('/pipeline')
      }
    }
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return
    
    const feedback = {
      id: Date.now().toString(),
      type: 'prd-change-request',
      prdId: params.id,
      text: feedbackText,
      timestamp: new Date().toISOString(),
      status: 'pending'
    }
    
    // Save to unified pipeline feedback system (monitored by River)
    await fetch('/api/pipeline/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        briefId: params.id,
        feedback: feedbackText,
        status: 'pending',
        source: 'prd-page',
        timestamp: new Date().toISOString()
      })
    })
    
    setFeedbackText('')
    setShowFeedback(false)
    alert('Feedback submitted! Daisy will review and act on it.')
  }

  const handleExportPDF = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const loadPRD = async () => {
    try {
      // Load PRD markdown content
      const contentResponse = await fetch(`/api/prds/${params.id}`)
      let content = ''
      
      if (contentResponse.ok) {
        content = await contentResponse.text()
      }
      
      if (!content) {
        setPRD(null)
        return
      }

      // Load pipeline state to get metadata
      const pipelineRes = await fetch('/api/pipeline-state')
      let title = params.id as string
      let sdsScore = 0
      let lastUpdated = new Date().toISOString()
      
      if (pipelineRes.ok) {
        const pipelineData = await pipelineRes.json()
        const item = pipelineData.items?.[params.id as string]
        if (item) {
          title = item.title || title
          sdsScore = item.sdsScore || 0
          lastUpdated = item.lastUpdated || lastUpdated
        }
      }

      // Extract title from markdown H1 if available
      const h1Match = content.match(/^#\s+(.+)$/m)
      if (h1Match) title = h1Match[1]

      setPRD({
        id: params.id as string,
        title,
        sdsScore,
        status: 'review',
        lastUpdated,
        content
      })
    } catch (error) {
      console.error('Failed to load PRD:', error)
      setPRD(null)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-background-subtle rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-background-subtle rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-background-subtle rounded"></div>
            <div className="h-4 bg-background-subtle rounded"></div>
            <div className="h-4 bg-background-subtle rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!prd) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">PRD Not Found</h1>
          <p className="text-foreground-muted mb-8">This PRD doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/pipeline')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Pipeline
          </button>
        </div>
      </div>
    )
  }

  const statusColors = {
    draft: 'bg-background-subtle',
    review: 'bg-amber-500',
    approved: 'bg-green-500',
    'in-development': 'bg-blue-500'
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="p-8 max-w-4xl mx-auto print-content">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/pipeline')}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4 no-print"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Pipeline
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{prd.title}</h1>
            <div className="flex items-center gap-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[prd.status]} text-white`}>
                {prd.status.toUpperCase()}
              </span>
              <span className="text-sm text-foreground-muted">
                SDS Score: <span className="font-bold text-green-600 dark:text-green-400">{prd.sdsScore}</span>
              </span>
              <span className="text-sm text-foreground-muted">
                Updated: {new Date(prd.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

{/* Metrics panel removed - data was hardcoded to '-' */}

      {/* PRD Content */}
      <div className="bg-surface border border-border rounded-lg p-8 prose prose-zinc dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline" />
          }}
        >
          {prd.content}
        </ReactMarkdown>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex items-center gap-4 no-print">
        {prd.status !== 'in-development' && (
          <button 
            onClick={handleMoveToMVP}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Move to MVP
          </button>
        )}
        <button 
          onClick={() => setShowFeedback(true)}
          className="px-6 py-2 border border-border rounded-lg hover:bg-surface-hover"
        >
          Request Changes
        </button>
        <button 
          onClick={handleExportPDF}
          className="px-6 py-2 border border-border rounded-lg hover:bg-surface-hover"
        >
          Export PDF
        </button>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">Request Changes to PRD</h3>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full h-32 p-3 border border-border rounded-lg bg-surface"
              placeholder="Describe the changes you'd like to see..."
            />
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={handleSubmitFeedback}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Feedback
              </button>
              <button
                onClick={() => setShowFeedback(false)}
                className="px-6 py-2 border border-border rounded-lg hover:bg-surface-hover"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}