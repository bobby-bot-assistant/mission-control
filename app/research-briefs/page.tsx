'use client'

import { useState, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'

interface Brief {
  id: string
  agent: string
  title: string
  filename: string
  path: string
  date: string
  created_at: string
  status: string
  uploadedToNotebookLM: boolean
  summary: string
}

const AGENT_COLORS: Record<string, string> = {
  Marshall: '#8B5CF6',
  Ada: '#F59E0B',
  Compass: '#10B981',
  Scout: '#3B82F6',
  Fern: '#EC4899',
}

const AGENT_LABELS: Record<string, string> = {
  Marshall: 'AI Governance & Constitutional AI',
  Ada: "Children's Digital Safety & Regulatory Intelligence",
  Compass: 'Product Ethics & Design Standards',
  Scout: 'General Intelligence & Opportunity Scanning',
  Fern: 'Clinical Review & Domain Mapping',
}

export default function ResearchBriefsPage() {
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedContent, setExpandedContent] = useState<string>('')
  const [loadingContent, setLoadingContent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [filterAgent, setFilterAgent] = useState<string>('All')
  const [filterUploaded, setFilterUploaded] = useState<string>('All')

  useEffect(() => {
    fetch('/api/research-briefs')
      .then(r => r.json())
      .then(data => {
        if (data.briefs) setBriefs(data.briefs)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const agents = useMemo(() => {
    const unique = Array.from(new Set(briefs.map(b => b.agent)))
    return unique.sort()
  }, [briefs])

  const filteredBriefs = useMemo(() => {
    let result = [...briefs]
    if (filterAgent !== 'All') result = result.filter(b => b.agent === filterAgent)
    if (filterUploaded === 'Yes') result = result.filter(b => b.uploadedToNotebookLM)
    if (filterUploaded === 'No') result = result.filter(b => !b.uploadedToNotebookLM)
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [briefs, filterAgent, filterUploaded])

  const groupedBriefs = useMemo(() => {
    const groups: Record<string, Brief[]> = {}
    filteredBriefs.forEach(b => {
      if (!groups[b.agent]) groups[b.agent] = []
      groups[b.agent].push(b)
    })
    return groups
  }, [filteredBriefs])

  const handleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      setExpandedContent('')
      return
    }
    setExpandedId(id)
    setLoadingContent(true)
    try {
      const res = await fetch(`/api/research-briefs/${id}/content`)
      const data = await res.json()
      setExpandedContent(data.content || 'No content available')
    } catch {
      setExpandedContent('Failed to load content')
    }
    setLoadingContent(false)
  }

  const handleToggleUploaded = async (id: string, current: boolean) => {
    try {
      await fetch('/api/research-briefs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, uploadedToNotebookLM: !current })
      })
      setBriefs(prev => prev.map(b => b.id === id ? { ...b, uploadedToNotebookLM: !current } : b))
    } catch (err) {
      console.error('Failed to toggle:', err)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(expandedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }

  const uploadedCount = briefs.filter(b => b.uploadedToNotebookLM).length
  const totalCount = briefs.length

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Loading research briefs...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-[28px] font-bold text-foreground">📚 NotebookLM Briefs</h1>
          <div className="text-sm text-foreground-muted">
            {uploadedCount}/{totalCount} uploaded to NotebookLM
          </div>
        </div>
        <p className="text-foreground-muted text-sm mb-6">
          Research intelligence from Marshall, Ada, Compass, Scout, and Fern. Copy briefs to upload to NotebookLM.
        </p>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select
            value={filterAgent}
            onChange={e => setFilterAgent(e.target.value)}
            className="bg-surface text-foreground border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value="All">All Agents</option>
            {agents.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            value={filterUploaded}
            onChange={e => setFilterUploaded(e.target.value)}
            className="bg-surface text-foreground border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value="All">All Upload Status</option>
            <option value="No">Not Uploaded</option>
            <option value="Yes">Uploaded</option>
          </select>
        </div>

        {/* Agent Sections */}
        {Object.entries(groupedBriefs).map(([agent, agentBriefs]) => (
          <div key={agent} className="mb-8">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: AGENT_COLORS[agent] || '#666' }}
              />
              <h2
                className="text-xl font-semibold"
                style={{ color: AGENT_COLORS[agent] || undefined }}
              >
                {agent}
              </h2>
              <span className="text-[13px] text-foreground-subtle">{AGENT_LABELS[agent] || ''}</span>
            </div>

            {agentBriefs.map(brief => (
              <div key={brief.id} className="mb-2">
                {/* Card */}
                <div
                  onClick={() => handleExpand(brief.id)}
                  className={`rounded-lg p-4 cursor-pointer transition-all border ${
                    expandedId === brief.id
                      ? 'bg-surface-hover border-border'
                      : 'bg-background-subtle border-border-subtle hover:border-border'
                  }`}
                  style={expandedId === brief.id ? { borderColor: (AGENT_COLORS[agent] || '#444') + '44' } : undefined}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-foreground mb-1.5">
                        {brief.title}
                      </h3>
                      <p className="text-[13px] text-foreground-muted mb-2">{brief.summary}</p>
                      <div className="flex gap-3 text-xs text-foreground-subtle">
                        <span>{brief.date}</span>
                        <span>•</span>
                        <span>{brief.filename}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleUploaded(brief.id, brief.uploadedToNotebookLM) }}
                        className={`rounded-full px-3 py-1 text-xs cursor-pointer whitespace-nowrap border ${
                          brief.uploadedToNotebookLM
                            ? 'bg-green-500/20 text-green-500 border-green-500'
                            : 'bg-surface border-border text-foreground-muted'
                        }`}
                      >
                        {brief.uploadedToNotebookLM ? '✓ Uploaded' : 'Not Uploaded'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === brief.id && (
                  <div
                    className="border border-t-0 rounded-b-lg p-5 max-h-[600px] overflow-auto bg-background-subtle"
                    style={{ borderColor: (AGENT_COLORS[agent] || '#444') + '33' }}
                  >
                    <div className="flex justify-end mb-3">
                      <button
                        onClick={handleCopy}
                        className={`border border-border rounded-md px-4 py-1.5 text-[13px] cursor-pointer ${
                          copied
                            ? 'bg-green-500 text-white'
                            : 'bg-surface text-foreground-muted hover:text-foreground'
                        }`}
                      >
                        {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
                      </button>
                    </div>
                    {loadingContent ? (
                      <p className="text-foreground-subtle">Loading brief...</p>
                    ) : (
                      <div className="text-foreground-muted text-sm leading-[1.7] prose prose-invert dark:prose-invert">
                        <ReactMarkdown>{expandedContent}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {filteredBriefs.length === 0 && (
          <div className="text-center py-[60px] text-foreground-subtle">
            <p>No research briefs found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
