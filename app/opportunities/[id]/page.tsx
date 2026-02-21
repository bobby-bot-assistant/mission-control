'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface OpportunityDetail {
  id: string
  name: string
  sds_score: number
  deadline?: string
  amount?: string
  description?: string
  result: 'YES' | 'PROBABLY' | 'LATER' | 'NO'
  related_project_id?: string
  reasoning?: string
  tags?: string[]
  research?: string[]
  tasks?: string[]
  documents?: string[]
  projectId?: string
}

const opportunitiesData: Record<string, OpportunityDetail> = {
  'opp-nih-sbir': {
    id: 'opp-nih-sbir',
    name: 'NIH SBIR Phase I',
    sds_score: 32.5,
    deadline: 'April 5, 2026',
    amount: '$300K',
    description: 'Story Hour with Simon - AI-powered bedtime interventions for preventive mental health',
    result: 'YES',
    related_project_id: 'proj_story_hour',
    reasoning: 'Highest SDS score due to: (1) Revenue potential $300K → $2M, (2) Perfect alignment with preventive mental health mission, (3) High leverage - unlocks Phase II and credibility, (4) Timeline fits Q2 2026 capacity, (5) Low cognitive load with clear SBIR framework',
    research: [
      'NIH reauthorization pending - creates timeline risk',
      'Pediatric sleep interventions: $2.3B market',
      'No existing AI-personalized bedtime solutions',
      'Parent co-regulation proven effective in studies'
    ],
    tasks: [
      'Complete Specific Aims draft',
      'Finalize usability study protocol',
      'Identify clinical collaborators',
      'Submit SAM.gov registration'
    ],
    documents: [
      'NIH_SBIR_Framework.md',
      'STORY_HOUR_SIMON.md',
      'Morning_Strategic_Brief.md'
    ]
  },
  'opp-nimh-digital': {
    id: 'opp-nimh-digital',
    name: 'NIMH Digital Mental Health NOFO',
    sds_score: 27.5,
    deadline: 'TBD - Awaiting announcement',
    amount: '$250K',
    description: 'Innovation funding for digital mental health interventions',
    result: 'YES',
    related_project_id: 'proj_story_hour',
    reasoning: 'Strong SDS due to: (1) Direct NIMH alignment, (2) Innovation focus matches our AI approach, (3) Can leverage NIH SBIR work, (4) Builds federal funding track record',
    research: [
      'NOFO expected Q2-Q3 2026',
      'Previous awards focused on youth interventions',
      'Digital-first solutions prioritized',
      'Requires preliminary data (usability study)'
    ],
    tasks: [
      'Monitor NIMH announcements',
      'Prepare innovation narrative',
      'Align with NIH SBIR timeline'
    ],
    documents: [
      'NIH_SBIR_Framework.md',
      'Grant_Pipeline_Analysis.md'
    ]
  }
}

export default function OpportunityDetail() {
  const params = useParams()
  const router = useRouter()
  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOpportunity() {
      if (params.id && typeof params.id === 'string') {
        try {
          const res = await fetch('/api/opportunities?q=' + params.id)
          if (res.ok) {
            const data = await res.json()
            const opp = data.find((o: OpportunityDetail) => o.id === params.id)
            if (opp) {
              setOpportunity(opp)
            }
          }
        } catch (error) {
          console.error('Failed to fetch opportunity:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchOpportunity()
  }, [params.id])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Loading...</h1>
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Opportunity Not Found</h1>
        <button 
          onClick={() => router.push('/executive')}
          className="text-blue-600 hover:underline"
        >
          ← Back to Executive Home
        </button>
      </div>
    )
  }

  const sdsColor = opportunity.sds_score >= 32 ? 'text-red-600 dark:text-red-400' : 
                  opportunity.sds_score >= 25 ? 'text-yellow-600 dark:text-yellow-400' : 
                  'text-foreground-muted'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button 
        onClick={() => router.push('/executive')}
        className="text-blue-600 dark:text-blue-400 hover:underline mb-6"
      >
        ← Back to Executive Home
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{opportunity.name}</h1>
            {opportunity.description && <p className="text-lg text-foreground-muted">{opportunity.description}</p>}
          </div>
          <div className="text-center ml-8">
            <p className={`text-4xl font-bold ${sdsColor}`}>{opportunity.sds_score}</p>
            <p className="text-sm text-foreground-muted">SDS Score</p>
          </div>
        </div>
        
        <div className="flex gap-4 text-sm">
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
            {opportunity.result}
          </span>
          {opportunity.amount && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
              {opportunity.amount}
            </span>
          )}
          {opportunity.deadline && (
            <span className="px-3 py-1 bg-secondary text-foreground-muted rounded">
              {opportunity.deadline}
            </span>
          )}
        </div>
      </div>

      {/* Reasoning */}
      {opportunity.reasoning && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">🧠 Strategic Reasoning</h2>
          <div className="bg-background-subtle rounded-lg p-4 border border-border">
            <p className="text-foreground-muted">{opportunity.reasoning}</p>
          </div>
        </section>
      )}

      {/* Tags */}
      {opportunity.tags && opportunity.tags.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">🏷️ Tags</h2>
          <div className="flex flex-wrap gap-2">
            {opportunity.tags.map((tag, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 bg-secondary rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push(`/projects?id=${opportunity.projectId}`)}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          View Project
        </button>
        <button
          onClick={() => router.push('/tasks')}
          className="px-6 py-2 border border-border rounded hover:bg-surface-hover transition-colors"
        >
          View All Tasks
        </button>
      </div>
    </div>
  )
}