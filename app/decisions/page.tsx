'use client'

import { useState, useEffect } from 'react'

interface SDSBreakdown {
  strategic: number
  doable: number
  rewarding: number
  sustainable: number
  total: number
}

interface DecisionOption {
  id: string
  title: string
  pros: string[]
  cons: string[]
  userScore?: SDSBreakdown
  aiScore?: SDSBreakdown
  aiReasoning?: string
}

interface Decision {
  id: string
  title: string
  context?: string
  created: string
  deadline?: string
  status: 'pending' | 'made' | 'rejected' | 'deferred'
  options: DecisionOption[]
  finalChoice?: string
  rationale?: string
  outcome?: string
  deferredUntil?: string
  rejectionReason?: string
  resolvedAt?: string
}

const calculateSDS = (s: number, d: number, sus: number, r: number): number => {
  return ((s * d * sus) + (r * 5)) / 10
}

function logInteraction(action: string, itemId: string, details?: Record<string, unknown>) {
  fetch('/api/decisions/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, itemId, ...details })
  }).catch(() => {})
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [showNewDecision, setShowNewDecision] = useState(false)
  const [expandedDecision, setExpandedDecision] = useState<string | null>(null)
  const [scoringOption, setScoringOption] = useState<{ decisionId: string; optionId: string } | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject' | 'defer'; decisionId: string; optionId?: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [deferDate, setDeferDate] = useState('')

  const [newDecision, setNewDecision] = useState({
    title: '', context: '', deadline: '',
    options: [
      { id: 'opt-1', title: '', pros: [''], cons: [''] },
      { id: 'opt-2', title: '', pros: [''], cons: [''] },
    ]
  })

  const [sdsScores, setSdsScores] = useState({ strategic: 5, doable: 5, sustainable: 5, rewarding: 5 })

  useEffect(() => {
    loadDecisions()
  }, [])

  const loadDecisions = async () => {
    try {
      const res = await fetch('/api/decisions')
      const data = await res.json()
      setDecisions(data)
      logInteraction('page_view', 'decisions', { count: data.length })
    } catch {
      setDecisions([])
    }
  }

  const saveDecision = async (decision: Decision) => {
    try {
      await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision)
      })
      loadDecisions()
    } catch (error) {
      console.error('Failed to save:', error)
    }
  }

  const createDecision = () => {
    const decision: Decision = {
      id: `dec-${Date.now()}`,
      title: newDecision.title,
      context: newDecision.context,
      created: new Date().toISOString(),
      deadline: newDecision.deadline || undefined,
      status: 'pending',
      options: newDecision.options.filter(opt => opt.title).map(opt => ({
        ...opt, pros: opt.pros.filter(Boolean), cons: opt.cons.filter(Boolean)
      }))
    }
    saveDecision(decision)
    logInteraction('create_decision', decision.id, { title: decision.title })
    setShowNewDecision(false)
    setNewDecision({ title: '', context: '', deadline: '', options: [{ id: 'opt-1', title: '', pros: [''], cons: [''] }, { id: 'opt-2', title: '', pros: [''], cons: [''] }] })
  }

  const scoreOption = (decisionId: string, optionId: string) => {
    const score: SDSBreakdown = { ...sdsScores, total: calculateSDS(sdsScores.strategic, sdsScores.doable, sdsScores.sustainable, sdsScores.rewarding) }
    const updated = decisions.map(dec =>
      dec.id === decisionId ? { ...dec, options: dec.options.map(opt => opt.id === optionId ? { ...opt, userScore: score } : opt) } : dec
    )
    setDecisions(updated)
    const decision = updated.find(d => d.id === decisionId)
    if (decision) saveDecision(decision)
    logInteraction('score_option', decisionId, { optionId, score: score.total })
    setScoringOption(null)
    setSdsScores({ strategic: 5, doable: 5, sustainable: 5, rewarding: 5 })
  }

  const approveDecision = (decisionId: string, optionId?: string) => {
    const decision = decisions.find(d => d.id === decisionId)
    if (!decision) return
    const choiceId = optionId || decision.options.reduce((best, opt) => {
      const score = opt.userScore?.total || opt.aiScore?.total || 0
      const bestScore = best.userScore?.total || best.aiScore?.total || 0
      return score > bestScore ? opt : best
    }).id
    const chosen = decision.options.find(o => o.id === choiceId)
    const updated = { ...decision, status: 'made' as const, finalChoice: choiceId, rationale: `Approved: ${chosen?.title}`, resolvedAt: new Date().toISOString() }
    setDecisions(prev => prev.map(d => d.id === decisionId ? updated : d))
    saveDecision(updated)
    logInteraction('approve', decisionId, { choiceId, title: chosen?.title })
    setConfirmAction(null)
  }

  const rejectDecision = (decisionId: string) => {
    const decision = decisions.find(d => d.id === decisionId)
    if (!decision) return
    const updated = { ...decision, status: 'rejected' as const, rejectionReason: rejectReason, resolvedAt: new Date().toISOString() }
    setDecisions(prev => prev.map(d => d.id === decisionId ? updated : d))
    saveDecision(updated)
    logInteraction('reject', decisionId, { reason: rejectReason })
    setConfirmAction(null)
    setRejectReason('')
  }

  const deferDecision = (decisionId: string) => {
    const decision = decisions.find(d => d.id === decisionId)
    if (!decision) return
    const updated = { ...decision, status: 'deferred' as const, deferredUntil: deferDate || undefined, resolvedAt: new Date().toISOString() }
    setDecisions(prev => prev.map(d => d.id === decisionId ? updated : d))
    saveDecision(updated)
    logInteraction('defer', decisionId, { until: deferDate })
    setConfirmAction(null)
    setDeferDate('')
  }

  const pending = decisions.filter(d => d.status === 'pending')
  const archived = decisions.filter(d => d.status !== 'pending')

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🤔 Command Center</h1>
        <p className="text-foreground-muted">Decision inbox — review, approve, reject, or defer.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{pending.length}</div>
          <div className="text-xs text-foreground-subtle">Pending</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{decisions.filter(d => d.status === 'made').length}</div>
          <div className="text-xs text-foreground-subtle">Approved</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{decisions.filter(d => d.status === 'rejected').length}</div>
          <div className="text-xs text-foreground-subtle">Rejected</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{decisions.filter(d => d.status === 'deferred').length}</div>
          <div className="text-xs text-foreground-subtle">Deferred</div>
        </div>
      </div>

      <button onClick={() => setShowNewDecision(true)} className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">+ New Decision</button>

      {/* New Decision Form */}
      {showNewDecision && (
        <div className="mb-8 p-6 bg-surface border border-border rounded-lg">
          <h3 className="font-semibold mb-4 text-foreground">Create New Decision</h3>
          <input type="text" placeholder="What needs to be decided?" value={newDecision.title} onChange={e => setNewDecision({ ...newDecision, title: e.target.value })}
            className="w-full mb-4 p-2 bg-background border border-border rounded text-foreground" />
          <textarea placeholder="Context (optional)" value={newDecision.context} onChange={e => setNewDecision({ ...newDecision, context: e.target.value })}
            className="w-full mb-4 p-2 bg-background border border-border rounded text-foreground" rows={2} />
          <input type="date" value={newDecision.deadline} onChange={e => setNewDecision({ ...newDecision, deadline: e.target.value })}
            className="mb-4 p-2 bg-background border border-border rounded text-foreground" />
          <div className="space-y-4">
            {newDecision.options.map((option, optIdx) => (
              <div key={option.id} className="p-4 bg-background rounded-lg">
                <input type="text" placeholder={`Option ${optIdx + 1}`} value={option.title}
                  onChange={e => { const o = [...newDecision.options]; o[optIdx] = { ...o[optIdx], title: e.target.value }; setNewDecision({ ...newDecision, options: o }) }}
                  className="w-full mb-2 p-2 bg-surface border border-border rounded text-foreground" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1 text-foreground">Pros</p>
                    {option.pros.map((pro, proIdx) => (
                      <input key={proIdx} type="text" value={pro} placeholder="Advantage"
                        onChange={e => { const o = [...newDecision.options]; o[optIdx] = { ...o[optIdx], pros: o[optIdx].pros.map((p, i) => i === proIdx ? e.target.value : p) }; setNewDecision({ ...newDecision, options: o }) }}
                        className="w-full mb-1 p-1 text-sm bg-surface border border-border rounded text-foreground" />
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1 text-foreground">Cons</p>
                    {option.cons.map((con, conIdx) => (
                      <input key={conIdx} type="text" value={con} placeholder="Disadvantage"
                        onChange={e => { const o = [...newDecision.options]; o[optIdx] = { ...o[optIdx], cons: o[optIdx].cons.map((c, i) => i === conIdx ? e.target.value : c) }; setNewDecision({ ...newDecision, options: o }) }}
                        className="w-full mb-1 p-1 text-sm bg-surface border border-border rounded text-foreground" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={createDecision} disabled={!newDecision.title} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">Create</button>
            <button onClick={() => setShowNewDecision(false)} className="px-4 py-2 bg-surface border border-border text-foreground-muted rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {/* Pending Decisions */}
      {pending.length === 0 && !showNewDecision && (
        <div className="bg-surface border border-border rounded-lg p-12 text-center mb-6">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-medium mb-2 text-foreground">Inbox Zero</h3>
          <p className="text-foreground-subtle text-sm">No pending decisions. Nice work!</p>
        </div>
      )}

      <div className="space-y-4 mb-8">
        {pending.map(decision => {
          const isExpanded = expandedDecision === decision.id
          const daysUntil = decision.deadline ? Math.floor((new Date(decision.deadline).getTime() - Date.now()) / 86400000) : null

          return (
            <div key={decision.id} className="bg-surface border border-border rounded-lg overflow-hidden">
              <button onClick={() => { setExpandedDecision(isExpanded ? null : decision.id); logInteraction('expand', decision.id) }}
                className="w-full p-4 text-left hover:bg-surface-hover/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{decision.title}</h3>
                    {decision.context && <p className="text-sm text-foreground-muted mt-1">{decision.context}</p>}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">pending</span>
                      {daysUntil !== null && (
                        <span className={daysUntil <= 1 ? 'text-red-400' : 'text-foreground-muted'}>
                          {daysUntil === 0 ? 'Due today' : daysUntil === 1 ? 'Due tomorrow' : daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : `Due in ${daysUntil}d`}
                        </span>
                      )}
                      <span className="text-foreground-subtle">{decision.options.length} options</span>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 transition-transform text-foreground-muted ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 border-t border-border">
                  <div className="space-y-4 mb-6">
                    {decision.options.map(option => {
                      const isScoring = scoringOption?.decisionId === decision.id && scoringOption?.optionId === option.id
                      const scores = decision.options.map(o => o.userScore?.total || o.aiScore?.total || 0)
                      const bestScore = Math.max(...scores)
                      const thisScore = option.userScore?.total || option.aiScore?.total || 0
                      const isBest = thisScore === bestScore && bestScore > 0

                      return (
                        <div key={option.id} className={`p-4 bg-background rounded-lg ${isBest ? 'ring-1 ring-emerald-500/50' : ''}`}>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-foreground">{option.title} {isBest && <span className="text-sm">⭐</span>}</h4>
                            <div className="flex items-center gap-2">
                              {option.userScore && <span className="text-sm font-bold text-blue-400">Score: {option.userScore.total.toFixed(1)}</span>}
                              {option.aiScore && <span className="text-sm font-bold text-emerald-400">AI: {option.aiScore.total.toFixed(1)}</span>}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div>
                              <p className="font-medium text-emerald-400 mb-1">Pros</p>
                              <ul className="space-y-0.5">{option.pros.map((pro, i) => <li key={i} className="text-foreground-muted">• {pro}</li>)}</ul>
                            </div>
                            <div>
                              <p className="font-medium text-red-400 mb-1">Cons</p>
                              <ul className="space-y-0.5">{option.cons.map((con, i) => <li key={i} className="text-foreground-muted">• {con}</li>)}</ul>
                            </div>
                          </div>
                          {option.aiReasoning && <p className="text-sm text-foreground-muted mb-3 italic">AI: {option.aiReasoning}</p>}

                          <div className="flex gap-2">
                            <button onClick={() => setScoringOption({ decisionId: decision.id, optionId: option.id })}
                              className="text-sm px-3 py-1 bg-surface border border-border rounded hover:border-foreground-subtle text-foreground-muted">Score</button>
                            <button onClick={() => setConfirmAction({ type: 'approve', decisionId: decision.id, optionId: option.id })}
                              className="text-sm px-3 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-600/30">✓ Approve This</button>
                          </div>

                          {isScoring && (
                            <div className="mt-4 p-4 bg-surface rounded-lg border border-border">
                              <h5 className="font-medium mb-3 text-foreground">SDS Framework Scoring</h5>
                              {(['strategic', 'doable', 'sustainable', 'rewarding'] as const).map(dim => (
                                <div key={dim} className="mb-3">
                                  <div className="flex justify-between mb-1">
                                    <label className="text-sm capitalize text-foreground">{dim}</label>
                                    <span className="text-sm font-bold text-foreground">{sdsScores[dim]}</span>
                                  </div>
                                  <input type="range" min="0" max="10" value={sdsScores[dim]}
                                    onChange={e => setSdsScores({ ...sdsScores, [dim]: parseInt(e.target.value) })}
                                    className="w-full accent-blue-500" />
                                  <p className="text-xs text-foreground-subtle mt-1">
                                    {dim === 'strategic' && 'Mission alignment?'}
                                    {dim === 'doable' && 'Realistically executable?'}
                                    {dim === 'sustainable' && 'Maintainable without burnout?'}
                                    {dim === 'rewarding' && 'Moves the needle?'}
                                  </p>
                                </div>
                              ))}
                              <div className="flex items-center justify-between mt-4">
                                <p className="font-medium text-foreground">Total: {calculateSDS(sdsScores.strategic, sdsScores.doable, sdsScores.sustainable, sdsScores.rewarding).toFixed(1)}</p>
                                <div className="flex gap-2">
                                  <button onClick={() => scoreOption(decision.id, option.id)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Save</button>
                                  <button onClick={() => setScoringOption(null)} className="px-3 py-1 bg-surface border border-border text-foreground-muted rounded text-sm">Cancel</button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <button onClick={() => setConfirmAction({ type: 'approve', decisionId: decision.id })}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">✓ Approve Best</button>
                    <button onClick={() => setConfirmAction({ type: 'reject', decisionId: decision.id })}
                      className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors">✗ Reject</button>
                    <button onClick={() => setConfirmAction({ type: 'defer', decisionId: decision.id })}
                      className="px-4 py-2 bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-600/30 transition-colors">⏸ Defer</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Archived Decisions */}
      {archived.length > 0 && (
        <div>
          <button onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-foreground-muted hover:text-foreground mb-4 transition-colors">
            <svg className={`w-4 h-4 transition-transform ${showArchived ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm font-medium">Resolved ({archived.length})</span>
          </button>
          {showArchived && (
            <div className="space-y-3">
              {archived.map(decision => (
                <div key={decision.id} className="bg-surface/50 border border-border rounded-lg p-4 opacity-75">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{decision.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          decision.status === 'made' ? 'bg-emerald-500/20 text-emerald-400' :
                          decision.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>{decision.status}</span>
                        {decision.finalChoice && <span className="text-foreground-muted">→ {decision.options.find(o => o.id === decision.finalChoice)?.title}</span>}
                        {decision.rejectionReason && <span className="text-foreground-subtle italic">{decision.rejectionReason}</span>}
                        {decision.deferredUntil && <span className="text-foreground-subtle">Until {decision.deferredUntil}</span>}
                      </div>
                    </div>
                    {decision.resolvedAt && <span className="text-xs text-foreground-subtle">{new Date(decision.resolvedAt).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-lg p-6 max-w-md w-full">
            {confirmAction.type === 'approve' && (
              <>
                <h3 className="text-lg font-bold mb-2 text-foreground">✓ Approve Decision</h3>
                <p className="text-foreground-muted mb-4">
                  {confirmAction.optionId
                    ? `Approve: "${decisions.find(d => d.id === confirmAction.decisionId)?.options.find(o => o.id === confirmAction.optionId)?.title}"`
                    : 'Approve the highest-scored option?'}
                </p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setConfirmAction(null)} className="px-4 py-2 text-foreground-muted">Cancel</button>
                  <button onClick={() => approveDecision(confirmAction.decisionId, confirmAction.optionId)} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Approve</button>
                </div>
              </>
            )}
            {confirmAction.type === 'reject' && (
              <>
                <h3 className="text-lg font-bold mb-2 text-foreground">✗ Reject Decision</h3>
                <textarea placeholder="Reason for rejecting (optional)" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                  className="w-full mb-4 p-2 bg-background border border-border rounded text-foreground" rows={3} />
                <div className="flex justify-end gap-3">
                  <button onClick={() => { setConfirmAction(null); setRejectReason('') }} className="px-4 py-2 text-foreground-muted">Cancel</button>
                  <button onClick={() => rejectDecision(confirmAction.decisionId)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
                </div>
              </>
            )}
            {confirmAction.type === 'defer' && (
              <>
                <h3 className="text-lg font-bold mb-2 text-foreground">⏸ Defer Decision</h3>
                <p className="text-foreground-muted mb-2">Revisit date (optional):</p>
                <input type="date" value={deferDate} onChange={e => setDeferDate(e.target.value)}
                  className="w-full mb-4 p-2 bg-background border border-border rounded text-foreground" />
                <div className="flex justify-end gap-3">
                  <button onClick={() => { setConfirmAction(null); setDeferDate('') }} className="px-4 py-2 text-foreground-muted">Cancel</button>
                  <button onClick={() => deferDecision(confirmAction.decisionId)} className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Defer</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
