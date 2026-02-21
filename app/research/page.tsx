'use client'

import { useState, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'

interface ResearchDoc {
  filename: string
  title: string
  content: string
  date: string
  summary: string
  lastModified: string
  size: number
}

interface Lead {
  id: string
  organization: string
  sector: string
  what_theyre_spending_on: string
  estimated_budget: string
  contact_info: string
  relevance: {
    advisory: string
    story_hour: string
    pulse: string
    grants: string
  }
  status: string
  source: string
  notes: string
  added_date: string
}

interface ResearchAgent {
  name: string
  emoji: string
  focus: string
  focusArea: string
  directory: string
  status: 'active' | 'idle'
  latestBrief: {
    filename: string
    date: string
  } | null
}

// Research Intelligence Unit data
const RESEARCH_AGENTS: ResearchAgent[] = [
  {
    name: 'Marshall',
    emoji: '⚖️',
    focus: 'AI Governance & Constitutional AI',
    focusArea: 'frameworks',
    directory: '~/openclaw-projects/research/marshall/',
    status: 'active',
    latestBrief: {
      filename: 'litigation-intel-feb2026.md',
      date: '2026-02-19'
    }
  },
  {
    name: 'Ada',
    emoji: '🛡️',
    focus: "Children's Digital Safety & Regulatory Intelligence",
    focusArea: 'regulations',
    directory: '~/openclaw-projects/research/ada/',
    status: 'active',
    latestBrief: {
      filename: 'benchmarking-data-framework.md',
      date: '2026-02-19'
    }
  },
  {
    name: 'Compass',
    emoji: '🧭',
    focus: 'Product Ethics & Design Standards',
    focusArea: 'implementation',
    directory: '~/openclaw-projects/research/compass/',
    status: 'active',
    latestBrief: {
      filename: 'age-appropriate-design-patterns.md',
      date: '2026-02-18'
    }
  }
]

// Pipeline stages
const PIPELINE_STAGES = [
  { agent: 'Marshall', focus: 'frameworks', color: '#8B5CF6' },
  { agent: 'Ada', focus: 'regulations', color: '#F59E0B' },
  { agent: 'Compass', focus: 'implementation', color: '#10B981' },
  { agent: 'Fern', focus: 'clinical validation', color: '#EC4899' },
  { agent: 'Pulse', focus: 'assessment delivery', color: '#3B82F6' }
]

const AGENT_COLORS: Record<string, string> = {
  Marshall: '#8B5CF6',
  Ada: '#F59E0B',
  Compass: '#10B981',
  Scout: '#3B82F6',
  Fern: '#EC4899',
}

export default function ResearchPage() {
  const [docs, setDocs] = useState<ResearchDoc[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'research' | 'docs' | 'leads'>('research')
  const [leadSearch, setLeadSearch] = useState('')
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  
  // Filter states
  const [sectorFilter, setSectorFilter] = useState('All')
  const [pulseFilter, setPulseFilter] = useState('All')
  const [grantsFilter, setGrantsFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  
  // Legend toggle
  const [showLegend, setShowLegend] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/research').then(r => r.json()),
      fetch('/api/research/leads').then(r => r.json())
    ])
      .then(([docsData, leadsData]) => {
        if (docsData.documents) {
          setDocs(docsData.documents)
        }
        if (leadsData.leads) {
          setLeads(leadsData.leads)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Filter leads based on search and filters
  const filteredLeads = useMemo(() => {
    let result = leads
    
    // Apply search
    if (leadSearch) {
      const search = leadSearch.toLowerCase()
      result = result.filter(lead => 
        lead.organization.toLowerCase().includes(search) ||
        lead.sector.toLowerCase().includes(search) ||
        lead.what_theyre_spending_on.toLowerCase().includes(search) ||
        lead.notes?.toLowerCase().includes(search)
      )
    }
    
    // Apply sector filter
    if (sectorFilter !== 'All') {
      result = result.filter(lead => lead.sector === sectorFilter)
    }
    
    // Apply pulse filter
    if (pulseFilter !== 'All') {
      result = result.filter(lead => lead.relevance.pulse.toLowerCase() === pulseFilter.toLowerCase())
    }
    
    // Apply grants filter
    if (grantsFilter !== 'All') {
      result = result.filter(lead => lead.relevance.grants.toLowerCase() === grantsFilter.toLowerCase())
    }
    
    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(lead => lead.status.toLowerCase() === statusFilter.toLowerCase())
    }
    
    // Sort by Pulse relevance (high first)
    const priority = { high: 0, medium: 1, low: 2, none: 3 }
    result = [...result].sort((a, b) => {
      const aPriority = priority[a.relevance.pulse as keyof typeof priority] ?? 3
      const bPriority = priority[b.relevance.pulse as keyof typeof priority] ?? 3
      return aPriority - bPriority
    })
    
    return result
  }, [leads, leadSearch, sectorFilter, pulseFilter, grantsFilter, statusFilter])

  // Get unique sectors for filter
  const sectors = useMemo(() => {
    const unique = new Set(leads.map(l => l.sector))
    return Array.from(unique).sort()
  }, [leads])

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'bg-green-600 text-white dark:bg-green-700 dark:text-green-100'
      case 'medium': return 'bg-amber-500 text-white dark:bg-amber-600 dark:text-amber-100'
      case 'low': return 'bg-gray-400 text-white dark:bg-gray-500 dark:text-gray-200'
      case 'none': return 'bg-transparent border-2 border-gray-300 text-gray-500 dark:border-gray-500 dark:text-gray-400'
      default: return 'bg-gray-400 text-white dark:bg-gray-600 dark:text-gray-200'
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500 text-white dark:bg-blue-600 dark:text-blue-100'
      case 'prospect': return 'bg-purple-500 text-white dark:bg-purple-600 dark:text-purple-100'
      case 'warm': return 'bg-orange-500 text-white dark:bg-orange-600 dark:text-orange-100'
      case 'contacted': return 'bg-teal-500 text-white dark:bg-teal-600 dark:text-teal-100'
      default: return 'bg-gray-500 text-white dark:bg-gray-600 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">🔬 Research & Intel</h1>
        <p className="text-gray-700 dark:text-gray-300">Loading research data...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">🔬 Research & Intel</h1>
        <p className="text-gray-700 dark:text-gray-300">
          Strategic research documents and leads database
        </p>
      </div>

      {/* Research Intelligence Unit Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">🧠 Research Intelligence Unit</h2>
        
        {/* Pipeline Visualization */}
        <div className="mb-6 p-4 bg-background-subtle rounded-lg border border-border">
          <p className="text-sm font-medium text-foreground-muted mb-3">Research Pipeline</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PIPELINE_STAGES.map((stage, idx) => (
              <div key={stage.agent} className="flex items-center">
                <div 
                  className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: stage.color }}
                >
                  {stage.agent}
                </div>
                {idx < PIPELINE_STAGES.length - 1 && (
                  <svg className="w-4 h-4 mx-1 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-xs text-foreground-subtle">
            {PIPELINE_STAGES.map((stage) => (
              <span key={stage.agent}>{stage.focus}</span>
            ))}
          </div>
        </div>

        {/* Research Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RESEARCH_AGENTS.map((agent) => (
            <div 
              key={agent.name}
              className="bg-surface border border-border rounded-lg p-4 hover:border-foreground-subtle transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{agent.emoji}</span>
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                    agent.status === 'active' 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-amber-500/20 text-amber-500'
                  }`}
                >
                  <span 
                    className={`w-2 h-2 rounded-full ${
                      agent.status === 'active' ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                  />
                  {agent.status === 'active' ? 'Active' : 'Idle'}
                </span>
              </div>
              <p className="text-sm text-foreground-muted mb-3">{agent.focus}</p>
              {agent.latestBrief && (
                <div className="text-xs text-foreground-subtle mb-2">
                  <span className="font-medium">Latest:</span> {agent.latestBrief.filename}
                  <br />
                  <span className="text-foreground-muted">{agent.latestBrief.date}</span>
                </div>
              )}
              <a 
                href={agent.directory}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                📂 View Research Directory →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('docs')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'docs' 
              ? 'bg-amber-600 text-white' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
          }`}
        >
          📄 Research Documents ({docs.length})
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'leads' 
              ? 'bg-amber-600 text-white' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
          }`}
        >
          🎯 Leads Database ({leads.length})
        </button>
      </div>

      {/* Research Documents Tab */}
      {activeTab === 'docs' && (
        <div className="space-y-4">
          {docs.length === 0 ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              No research documents found in ~/openclaw-projects/pulse/docs/research/
            </div>
          ) : (
            docs.map((doc) => {
              const isExpanded = expandedDoc === doc.filename
              
              return (
                <div
                  key={doc.filename}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800"
                >
                  <button
                    onClick={() => setExpandedDoc(isExpanded ? null : doc.filename)}
                    className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl">📄</span>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{doc.title}</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{doc.summary}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-500">
                          <span>📅 {doc.date}</span>
                          <span>📝 {Math.round(doc.size / 1024)}KB</span>
                        </div>
                      </div>
                      <svg 
                        className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="pt-6 prose prose-gray dark:prose-invert max-w-none prose-sm prose-p:text-gray-700 dark:prose-p:text-gray-300">
                        <ReactMarkdown>{doc.content}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Leads Database Tab */}
      {activeTab === 'leads' && (
        <div>
          {/* Search and Filters Row */}
          <div className="mb-4 flex flex-col lg:flex-row gap-4">
            <input
              type="text"
              placeholder="Search leads by organization, sector, or keywords..."
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-amber-500 focus:outline-none"
            />
          </div>
          
          {/* Filter Dropdowns */}
          <div className="mb-4 flex flex-wrap gap-3">
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:border-amber-500 focus:outline-none"
            >
              <option value="All">All Sectors</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
            
            <select
              value={pulseFilter}
              onChange={(e) => setPulseFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:border-amber-500 focus:outline-none"
            >
              <option value="All">All Pulse</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="None">None</option>
            </select>
            
            <select
              value={grantsFilter}
              onChange={(e) => setGrantsFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:border-amber-500 focus:outline-none"
            >
              <option value="All">All Grants</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="None">None</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:border-amber-500 focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="new">New</option>
              <option value="prospect">Prospect</option>
              <option value="warm">Warm</option>
              <option value="contacted">Contacted</option>
            </select>
          </div>

          {/* Legend Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span>ℹ️ Column Guide</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showLegend ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Legend Card */}
          {showLegend && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">📊 Column Key</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">• Pulse — Relevance to Pulse maturity framework assessment (how likely this org would use our assessment)</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">• Grants — Grant funding opportunities available from/through this organization</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">• Status — Current relationship stage with this lead</p>
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">🏷️ Badge Meanings:</p>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <p><span className="inline-block px-1.5 py-0.5 bg-green-600 text-white text-xs rounded">high</span> — Strong fit / high relevance</p>
                    <p><span className="inline-block px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded">medium</span> — Moderate fit / worth exploring</p>
                    <p><span className="inline-block px-1.5 py-0.5 bg-gray-400 text-white text-xs rounded">low</span> — Lower priority / tangential fit</p>
                    <p><span className="inline-block px-1.5 py-0.5 border-2 border-gray-300 text-gray-500 text-xs rounded">none</span> — Not applicable</p>
                    <p><span className="inline-block px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded">new</span> — Recently added, not yet contacted</p>
                    <p><span className="inline-block px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded">prospect</span> — Identified as potential lead</p>
                    <p><span className="inline-block px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded">warm</span> — Active conversation</p>
                    <p><span className="inline-block px-1.5 py-0.5 bg-teal-500 text-white text-xs rounded">contacted</span> — Outreach sent, awaiting response</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results count */}
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredLeads.length} of {leads.length} leads
          </p>

          {/* Leads Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Organization</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Sector</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">What They're Spending On</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Budget</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Pulse</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Grants</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">{lead.organization}</div>
                      {lead.contact_info && (
                        <div className="text-xs text-gray-500 dark:text-gray-500">{lead.contact_info}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 capitalize text-gray-700 dark:text-gray-300">{lead.sector}</td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="line-clamp-2 text-gray-700 dark:text-gray-300" title={lead.what_theyre_spending_on}>
                        {lead.what_theyre_spending_on}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {lead.estimated_budget}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${getRelevanceColor(lead.relevance.pulse)}`}>
                        {lead.relevance.pulse}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${getRelevanceColor(lead.relevance.grants)}`}>
                        {lead.relevance.grants}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              No leads match your search criteria.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
