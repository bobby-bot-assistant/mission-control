'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface OpportunityDetail {
  id: string
  name: string
  sds: number
  deadline?: string
  amount?: string
  description: string
  result: 'YES' | 'PROBABLY' | 'LATER' | 'NO'
  projectId?: string
  reasoning: string
  research: string[]
  tasks: string[]
  documents: string[]
}

const opportunitiesData: Record<string, OpportunityDetail> = {
  'opp-nih-sbir': {
    id: 'opp-nih-sbir',
    name: 'NIH SBIR Phase I',
    sds: 32.5,
    deadline: 'April 5, 2026',
    amount: '$300K',
    description: 'Story Hour with Simon - AI-powered bedtime interventions for preventive mental health',
    result: 'YES',
    projectId: 'proj_story_hour',
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
    sds: 27.5,
    deadline: 'TBD - Awaiting announcement',
    amount: '$250K',
    description: 'Innovation funding for digital mental health interventions',
    result: 'YES',
    projectId: 'proj_story_hour',
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
  },
  'opp-grantscout': {
    id: 'opp-grantscout',
    name: 'GrantScout Commercialization',
    sds: 23.0,
    deadline: 'Ongoing',
    amount: 'Revenue Stream',
    description: 'SaaS tool for grant discovery and tracking',
    result: 'YES',
    projectId: 'proj_grant_engine',
    reasoning: 'Revenue diversification opportunity: (1) Existing codebase, (2) Clear market need, (3) Subscription model, (4) Low marginal cost, (5) Supports grant-seeking community',
    research: [
      'Grant management software: $500M market',
      'Competitors: GrantStation, GrantHub, Instrumentl',
      'Differentiation: AI-powered matching',
      'Pricing: $99-299/month tier structure'
    ],
    tasks: [
      'MVP feature prioritization',
      'Landing page design',
      'Stripe integration',
      'Beta user recruitment'
    ],
    documents: [
      'GrantScout_Business_Plan.md',
      'Revenue_Model_Analysis.md'
    ]
  }
}

export default function OpportunityDetail() {
  const params = useParams()
  const router = useRouter()
  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null)

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      const opp = opportunitiesData[params.id]
      if (opp) {
        setOpportunity(opp)
      }
    }
  }, [params.id])

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

  const sdsColor = opportunity.sds >= 32 ? 'text-red-600 dark:text-red-400' : 
                  opportunity.sds >= 25 ? 'text-yellow-600 dark:text-yellow-400' : 
                  'text-zinc-600 dark:text-zinc-400'

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
            <p className="text-lg text-zinc-600 dark:text-zinc-400">{opportunity.description}</p>
          </div>
          <div className="text-center ml-8">
            <p className={`text-4xl font-bold ${sdsColor}`}>{opportunity.sds}</p>
            <p className="text-sm text-zinc-500">SDS Score</p>
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
            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded">
              {opportunity.deadline}
            </span>
          )}
        </div>
      </div>

      {/* Reasoning */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">🧠 Strategic Reasoning</h2>
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-700 dark:text-zinc-300">{opportunity.reasoning}</p>
        </div>
      </section>

      {/* Research */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">🔍 Key Research</h2>
        <ul className="space-y-2">
          {opportunity.research.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-green-600 dark:text-green-400 mt-1">•</span>
              <span className="text-zinc-700 dark:text-zinc-300">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Tasks */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">✅ Required Tasks</h2>
        <div className="space-y-2">
          {opportunity.tasks.map((task, idx) => (
            <div 
              key={idx}
              className="p-3 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800"
            >
              <p className="text-zinc-700 dark:text-zinc-300">{task}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Documents */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">📄 Related Documents</h2>
        <div className="space-y-2">
          {opportunity.documents.map((doc, idx) => (
            <button
              key={idx}
              onClick={() => router.push(`/docs?search=${doc}`)}
              className="p-3 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 w-full text-left hover:shadow-md transition-shadow"
            >
              <p className="text-blue-600 dark:text-blue-400 font-medium">{doc}</p>
            </button>
          ))}
        </div>
      </section>

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
          className="px-6 py-2 border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          View All Tasks
        </button>
      </div>
    </div>
  )
}