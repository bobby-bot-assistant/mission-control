'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleMoveToIdea = async () => {
    setIsProcessing(true)
    // API call would go here
    setTimeout(() => {
      router.push('/pipeline')
    }, 1000)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
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

        <h1 className="text-3xl font-bold mb-2">Opportunity Details</h1>
        <p className="text-foreground-muted">
          Review this opportunity and decide whether to move it forward in the pipeline.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Opportunity ID: {params.id}</h2>
        <p className="text-foreground-muted mb-6">
          This opportunity requires further analysis before proceeding to the idea stage.
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={handleMoveToIdea}
            disabled={isProcessing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Move to Idea Stage'}
          </button>
          <button
            onClick={() => router.push('/pipeline')}
            className="px-6 py-2 border border-border rounded-lg hover:bg-surface-hover"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}