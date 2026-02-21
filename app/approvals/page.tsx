'use client'

import { useState, useEffect } from 'react'

interface Approval {
  id: string
  title: string
  type: string
  status: string
  content: string
  notes?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

const typeColors: Record<string, string> = {
  'email-draft': 'bg-purple-500/20 text-purple-400',
  'content-draft': 'bg-blue-500/20 text-blue-400',
  'proposal': 'bg-amber-500/20 text-amber-400',
  'scout-alert': 'bg-red-500/20 text-red-400',
  'other': 'bg-gray-500/20 text-gray-400',
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  revised: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected'

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [filter, setFilter] = useState<FilterTab>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [notesId, setNotesId] = useState<string | null>(null)
  const [notesText, setNotesText] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const API_KEY = 'a67cfc2e96d88eec78d49709c23cc166e3931c956200324da2a0580974783a48'

  const load = () => fetch('/api/approvals', { headers: { 'x-api-key': API_KEY } }).then(r => r.json()).then(setApprovals)
  useEffect(() => { load() }, [])

  const pendingCount = approvals.filter(a => a.status === 'pending').length
  const filtered = filter === 'all' ? approvals : approvals.filter(a => a.status === filter)

  const updateStatus = async (id: string, status: string, notes?: string) => {
    await fetch('/api/approvals', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({ id, status, ...(notes ? { notes } : {}) })
    })
    setNotesId(null)
    setNotesText('')
    load()
  }

  const copyContent = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">✅ Approval Queue</h1>
            <p className="text-foreground-muted text-sm mt-1">Review and approve pending items</p>
          </div>
          {pendingCount > 0 && (
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-sm font-medium">
              {pendingCount} pending
            </span>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-surface border border-border text-foreground-muted hover:bg-surface-hover'
              }`}
            >
              {tab.label}
              {tab.key === 'pending' && pendingCount > 0 && (
                <span className="ml-2 bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-full text-xs">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-surface border border-border rounded-lg p-8 text-center text-foreground-muted">
            No {filter === 'all' ? '' : filter} items.
          </div>
        )}

        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="bg-surface border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full text-left p-4 hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${typeColors[item.type] || typeColors.other}`}>
                        {item.type}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${statusColors[item.status] || ''}`}>
                        {item.status}
                      </span>
                    </div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-foreground-muted mt-1">
                      {(item.content || '').substring(0, 200)}{(item.content || '').length > 200 ? '...' : ''}
                    </p>
                    <p className="text-xs text-foreground-muted mt-2">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-foreground-muted ml-2">{expandedId === item.id ? '▼' : '▶'}</span>
                </div>
              </button>

              {expandedId === item.id && (
                <div className="border-t border-border p-4 bg-background-subtle">
                  <div className="whitespace-pre-wrap text-sm text-foreground-muted mb-4">{item.content}</div>

                  {item.notes && (
                    <div className="mb-4 p-3 bg-surface border border-border rounded text-sm">
                      <span className="font-medium text-foreground">Notes:</span> {item.notes}
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(item.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, 'rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm"
                        >
                          ❌ Reject
                        </button>
                        <button
                          onClick={() => setNotesId(notesId === item.id ? null : item.id)}
                          className="bg-surface border border-border hover:bg-surface-hover text-foreground px-3 py-1.5 rounded text-sm"
                        >
                          ✏️ Request Changes
                        </button>
                      </>
                    )}
                    {item.status === 'approved' && (
                      <>
                        <button
                          onClick={() => copyContent(item.id, item.content)}
                          className="bg-surface border border-border hover:bg-surface-hover text-foreground px-3 py-1.5 rounded text-sm"
                        >
                          {copied === item.id ? '✓ Copied!' : '📋 Copy Content'}
                        </button>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          📤 Variants auto-generated in Content Studio
                        </span>
                      </>
                    )}
                  </div>

                  {notesId === item.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={notesText}
                        onChange={e => setNotesText(e.target.value)}
                        placeholder="Enter revision notes..."
                        className="flex-1 bg-surface border border-border rounded px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => updateStatus(item.id, 'revised', notesText)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
