'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SDSBreakdown {
  strategic: number      
  doable: number        
  sustainable: number   
  rewarding: number     
  total: number        
}

interface AnalyzedOption {
  id: string
  title: string
  pros: string[]
  cons: string[]
  sdsScore: SDSBreakdown
  reasoning: string
}

interface DecisionAnalysis {
  id: string
  title: string
  context: string
  analyzedAt: string
  options: AnalyzedOption[]
  recommendation: {
    optionId: string
    confidence: 'high' | 'medium' | 'low'
    rationale: string
    risks: string[]
    nextSteps: string[]
  }
  presented: boolean
  userDecision?: {
    optionId: string
    decidedAt: string
    outcome?: string
  }
}

export default function AnalysisPage() {
  const [analyses, setAnalyses] = useState<DecisionAnalysis[]>([])
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'decided'>('pending')

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    try {
      const res = await fetch('/api/analysis')
      const data = await res.json()
      setAnalyses(data)
    } catch (error) {
      // Example analyses for demonstration
      setAnalyses([
        // No example analyses - real analyses will be loaded from API
      ])
    }
  }

  const filteredAnalyses = analyses.filter(analysis => {
    if (filter === 'pending') return !analysis.userDecision
    if (filter === 'decided') return !!analysis.userDecision
    return true
  })

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-success'
      case 'medium': return 'text-warning'
      case 'low': return 'text-error'
      default: return 'text-foreground-muted'
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧠 Decision Analysis</h1>
        <p className="text-foreground-muted">Daisy\'s strategic analysis and recommendations</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['pending', 'decided', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium capitalize theme-transition ${
              filter === f 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:opacity-90'
            }`}
          >
            {f} ({analyses.filter(a => {
              if (f === 'pending') return !a.userDecision
              if (f === 'decided') return !!a.userDecision
              return true
            }).length})
          </button>
        ))}
      </div>

      {/* Analyses List */}
      <div className="space-y-4">
        {filteredAnalyses.map(analysis => {
          const isActive = activeAnalysis === analysis.id
          const recommended = analysis.options.find(o => o.id === analysis.recommendation.optionId)
          const decided = analysis.userDecision && analysis.options.find(o => o.id === analysis.userDecision?.optionId)
          
          return (
            <div key={analysis.id} className="bg-surface border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveAnalysis(isActive ? null : analysis.id)}
                className="w-full p-4 text-left hover:bg-surface-hover theme-transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{analysis.title}</h3>
                    <p className="text-sm text-foreground-muted mb-2">{analysis.context}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Recommendation:</span>
                        <span className={getConfidenceColor(analysis.recommendation.confidence)}>
                          {recommended?.title} ({analysis.recommendation.confidence} confidence)
                        </span>
                      </span>
                      
                      {analysis.userDecision && (
                        <span className="flex items-center gap-1">
                          <span className="text-success">✓ Decided:</span>
                          <span>{decided?.title}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <svg 
                    className={`w-5 h-5 transition-transform ${isActive ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {isActive && (
                <div className="px-4 pb-4 border-t border-border">
                  {/* Option Comparison */}
                  <div className="mt-4">
                    <h4 className="font-semibold mb-3">Option Analysis</h4>
                    
                    <div className="space-y-4">
                      {analysis.options.map(option => {
                        const isRecommended = option.id === analysis.recommendation.optionId
                        const wasChosen = option.id === analysis.userDecision?.optionId
                        
                        return (
                          <div 
                            key={option.id}
                            className={`p-4 bg-background rounded-lg border-2 theme-transition ${
                              isRecommended ? 'border-success' : 
                              wasChosen ? 'border-info' : 
                              'border-transparent'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h5 className="font-medium">
                                  {option.title}
                                  {isRecommended && <span className="ml-2 text-sm text-success">⭐ Recommended</span>}
                                  {wasChosen && <span className="ml-2 text-sm text-info">✓ Chosen</span>}
                                </h5>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-2xl font-bold">{option.sdsScore.total.toFixed(1)}</div>
                                <div className="text-xs text-foreground-muted">SDS Score</div>
                              </div>
                            </div>
                            
                            {/* SDS Breakdown */}
                            <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                              <div>
                                <div className="text-xs text-foreground-muted">Strategic</div>
                                <div className="font-semibold">{option.sdsScore.strategic}</div>
                              </div>
                              <div>
                                <div className="text-xs text-foreground-muted">Doable</div>
                                <div className="font-semibold">{option.sdsScore.doable}</div>
                              </div>
                              <div>
                                <div className="text-xs text-foreground-muted">Sustainable</div>
                                <div className="font-semibold">{option.sdsScore.sustainable}</div>
                              </div>
                              <div>
                                <div className="text-xs text-foreground-muted">Rewarding</div>
                                <div className="font-semibold">{option.sdsScore.rewarding}</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-2 text-sm">
                              <div>
                                <p className="font-medium text-success mb-1">Pros</p>
                                <ul className="space-y-0.5">
                                  {option.pros.map((pro, idx) => (
                                    <li key={idx} className="text-foreground-muted">• {pro}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="font-medium text-error mb-1">Cons</p>
                                <ul className="space-y-0.5">
                                  {option.cons.map((con, idx) => (
                                    <li key={idx} className="text-foreground-muted">• {con}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            <p className="text-sm text-foreground-muted italic">{option.reasoning}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Recommendation Details */}
                  <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                    <h4 className="font-semibold mb-2">My Recommendation</h4>
                    <p className="mb-3">{analysis.recommendation.rationale}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-error mb-1">Risks to Watch</p>
                        <ul className="space-y-0.5">
                          {analysis.recommendation.risks.map((risk, idx) => (
                            <li key={idx} className="text-foreground-muted">• {risk}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-success mb-1">Next Steps</p>
                        <ol className="space-y-0.5">
                          {analysis.recommendation.nextSteps.map((step, idx) => (
                            <li key={idx} className="text-foreground-muted">{idx + 1}. {step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                  
                  {/* User Decision Tracking */}
                  {analysis.userDecision ? (
                    <div className="mt-4 p-4 bg-info/10 border border-info/20 rounded-lg">
                      <p className="font-medium">
                        Decision Made: {decided?.title}
                      </p>
                      <p className="text-sm text-foreground-muted">
                        {new Date(analysis.userDecision.decidedAt).toLocaleDateString()}
                      </p>
                      {analysis.userDecision.outcome && (
                        <p className="mt-2 text-sm">Outcome: {analysis.userDecision.outcome}</p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 flex gap-3">
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                        Present to Bobby
                      </button>
                      <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg">
                        Update Analysis
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}