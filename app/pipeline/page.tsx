'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SDSScores {
  strategic: number
  doable: number
  rewarding: number
  sustainable: number
}

interface SDSFormulaBreakdown {
  phase?: number
  revenue?: number
  alignment?: number
  leverage?: number
  timeFit?: number
  cognitiveLoad?: number
  formula?: string
}

interface PipelineItem {
  id: string
  title: string
  stage: 'opportunity' | 'idea' | 'prd' | 'mvp' | 'live' | 'archived'
  sdsScore: number
  sdsBreakdown?: SDSScores
  sdsFormulaBreakdown?: SDSFormulaBreakdown
  source: string
  createdAt: string
  crisis?: string
  gate?: string
  notes?: string
}

const thresholds: Record<string, { next: string; score: number }> = {
  opportunity: { next: 'idea', score: 18 },
  idea: { next: 'prd', score: 25 },
  prd: { next: 'mvp', score: 30 },
}

const stageConfig = {
  opportunity: { label: 'Opportunities', color: 'bg-foreground-subtle', icon: '🔍' },
  idea: { label: 'Ideas', color: 'bg-blue-500', icon: '💡' },
  prd: { label: 'PRDs', color: 'bg-purple-500', icon: '📄' },
  mvp: { label: 'MVPs', color: 'bg-green-500', icon: '🚀' },
  live: { label: 'Live', color: 'bg-emerald-500', icon: '🟢' },
  archived: { label: 'Archived', color: 'bg-gray-400', icon: '📦' },
}

const calculateSDS = (s: SDSScores): number => {
  return ((s.strategic * s.doable * s.sustainable) + (s.rewarding * 5)) / 10
}

function logInteraction(action: string, itemId: string, details?: Record<string, unknown>) {
  fetch('/api/pipeline/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, itemId, ...details })
  }).catch(() => {})
}

export default function PipelinePage() {
  const router = useRouter()
  const [items, setItems] = useState<PipelineItem[]>([])
  const [filter, setFilter] = useState<'all' | 'opportunity' | 'idea' | 'prd' | 'mvp' | 'live' | 'archived'>('all')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editScores, setEditScores] = useState<SDSScores>({ strategic: 5, doable: 5, rewarding: 5, sustainable: 5 })
  const [editFormulaScores, setEditFormulaScores] = useState<SDSFormulaBreakdown>({
    revenue: 5, alignment: 5, leverage: 5, timeFit: 5, cognitiveLoad: 3
  })
  const [useFormulaScores, setUseFormulaScores] = useState(false)
  const [showNewOpportunity, setShowNewOpportunity] = useState(false)
  const [advanceConfirm, setAdvanceConfirm] = useState<string | null>(null)
  const [archiveConfirm, setArchiveConfirm] = useState<string | null>(null)
  const [expandedSDS, setExpandedSDS] = useState<string | null>(null)

  useEffect(() => {
    loadPipelineItems()
  }, [])

  const loadPipelineItems = async () => {
    try {
      const response = await fetch('/api/pipeline-state')
      if (response.ok) {
        const data = await response.json()
        const loaded: PipelineItem[] = Object.entries(data.items || {}).map(([id, item]: [string, any]) => ({
          id,
          title: item.title,
          stage: item.stage,
          sdsScore: item.sdsScore || 0,
          // Old 4-dimension format: has 'strategic' field
          sdsBreakdown: item.sdsBreakdown && item.sdsBreakdown.strategic ? item.sdsBreakdown : undefined,
          // New 6-dimension formula format: has 'formula' field
          sdsFormulaBreakdown: item.sdsBreakdown && item.sdsBreakdown.formula ? item.sdsBreakdown : undefined,
          source: item.source || 'Research',
          createdAt: item.lastUpdated || new Date().toISOString(),
          crisis: item.crisis || 'Pediatric Mental Health',
          gate: item.gate || 'Product + Advisory',
          notes: item.notes || undefined
        }))
        setItems(loaded)
        logInteraction('page_view', 'pipeline', { itemCount: loaded.length })
      }
    } catch {
      setItems([
        {
          id: 'infant-mental-health',
          title: 'Story Hour with Simon: Media-Based Developmental Screening',
          stage: 'prd',
          sdsScore: 28.5,
          sdsBreakdown: { strategic: 8, doable: 7, rewarding: 9, sustainable: 5 },
          source: 'Research',
          createdAt: new Date().toISOString(),
          crisis: 'Pediatric Mental Health',
          gate: 'Product + Advisory'
        }
      ])
    }
  }

  const startEditing = (item: PipelineItem) => {
    setEditingItem(item.id)
    // Check which score format the item uses
    if (item.sdsFormulaBreakdown && item.sdsFormulaBreakdown.formula) {
      setUseFormulaScores(true)
      setEditFormulaScores({
        revenue: item.sdsFormulaBreakdown.revenue ?? 5,
        alignment: item.sdsFormulaBreakdown.alignment ?? 5,
        leverage: item.sdsFormulaBreakdown.leverage ?? 5,
        timeFit: item.sdsFormulaBreakdown.timeFit ?? 5,
        cognitiveLoad: item.sdsFormulaBreakdown.cognitiveLoad ?? 3,
      })
    } else {
      setUseFormulaScores(false)
      setEditScores(item.sdsBreakdown || { strategic: 5, doable: 5, rewarding: 5, sustainable: 5 })
    }
    logInteraction('open_editor', item.id, { title: item.title, format: item.sdsFormulaBreakdown ? 'formula' : 'legacy' })
  }

  // Calculate formula-based SDS score
  const calculateFormulaSDS = (s: SDSFormulaBreakdown): number => {
    const r = s.revenue ?? 5
    const a = s.alignment ?? 5
    const l = s.leverage ?? 5
    const t = s.timeFit ?? 5
    const c = s.cognitiveLoad ?? 3
    return (r * 2) + (a * 2) + (l * 1.5) + (t * 1) - (c * 1)
  }

  const saveScores = async (itemId: string) => {
    let newTotal: number
    let sdsBreakdown: SDSScores | undefined
    let sdsFormulaBreakdown: SDSFormulaBreakdown | undefined

    if (useFormulaScores) {
      // Formula-based scoring (new 6-dimension)
      newTotal = calculateFormulaSDS(editFormulaScores)
      sdsFormulaBreakdown = {
        ...editFormulaScores,
        formula: `(${editFormulaScores.revenue}x2)+(${editFormulaScores.alignment}x2)+(${editFormulaScores.leverage}x1.5)+(${editFormulaScores.timeFit}x1)-(${editFormulaScores.cognitiveLoad}x1)=${newTotal.toFixed(1)}`
      }
      setItems(prev => prev.map(i => i.id === itemId ? { 
        ...i, 
        sdsScore: newTotal, 
        sdsFormulaBreakdown,
        sdsBreakdown: undefined
      } : i))
    } else {
      // Legacy 4-dimension scoring
      newTotal = calculateSDS(editScores)
      sdsBreakdown = { ...editScores }
      setItems(prev => prev.map(i => i.id === itemId ? { 
        ...i, 
        sdsScore: newTotal, 
        sdsBreakdown,
        sdsFormulaBreakdown: undefined
      } : i))
    }

    try {
      const response = await fetch('/api/pipeline-state')
      if (response.ok) {
        const data = await response.json()
        if (data.items && data.items[itemId]) {
          data.items[itemId].sdsScore = newTotal
          if (useFormulaScores) {
            data.items[itemId].sdsBreakdown = sdsFormulaBreakdown
          } else {
            data.items[itemId].sdsBreakdown = sdsBreakdown
          }
          data.items[itemId].lastUpdated = new Date().toISOString()
          await fetch('/api/pipeline-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
        }
      }
    } catch (e) {
      console.error('Failed to save scores:', e)
    }

    logInteraction('score_update', itemId, { 
      scores: useFormulaScores ? editFormulaScores : editScores, 
      total: newTotal,
      format: useFormulaScores ? 'formula' : 'legacy'
    })
    setEditingItem(null)
  }

  const advanceItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return
    const th = thresholds[item.stage]
    if (!th) return

    const newStage = th.next as PipelineItem['stage']
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, stage: newStage } : i))

    try {
      const response = await fetch('/api/pipeline-state')
      if (response.ok) {
        const data = await response.json()
        if (data.items && data.items[itemId]) {
          data.items[itemId].stage = newStage
          data.items[itemId].lastUpdated = new Date().toISOString()
          await fetch('/api/pipeline-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
        }
      }
      
      // Also log to transition queue
      await fetch('/api/pipeline/transitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          itemTitle: item.title,
          fromStage: item.stage,
          toStage: newStage,
          action: 'advance_stage'
        })
      })
    } catch (e) {
      console.error('Failed to advance:', e)
    }

    logInteraction('advance', itemId, { from: item.stage, to: newStage, title: item.title })
    setAdvanceConfirm(null)
  }

  const archiveItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return
    const prevStage = item.stage

    setItems(prev => prev.map(i => i.id === itemId ? { ...i, stage: 'archived' as const } : i))

    try {
      await fetch('/api/pipeline-state', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, stage: 'archived' })
      })
    } catch (e) {
      console.error('Failed to archive:', e)
    }

    logInteraction('archive', itemId, { from: prevStage, title: item.title })
    setArchiveConfirm(null)
  }

  const getItemsByStage = (stage: PipelineItem['stage']) => items.filter(item => item.stage === stage)
  const activeItems = items.filter(item => item.stage !== 'archived')
  const filteredItems = filter === 'all' ? activeItems : items.filter(item => item.stage === filter)

  const velocity = { ideasPerWeek: 3.2, hitRate: 67, avgTime: 14 }

  function handleItemClick(item: PipelineItem) {
    if (editingItem === item.id) return
    switch (item.stage) {
      case 'idea': router.push(`/pipeline/briefs/${item.id}`); break
      case 'prd': router.push(`/pipeline/prds/${item.id}`); break
      case 'mvp': 
      case 'live': router.push(`/pipeline/mvp/${item.id}`); break
      default: router.push(`/pipeline/opportunities/${item.id}`)
    }
  }

  // Bar chart component for SDS breakdown
  const SDSBarChart = ({ scores, size = 'sm' }: { scores: SDSScores; size?: 'sm' | 'lg' }) => {
    const dims = [
      { key: 'strategic', label: 'S', color: 'bg-blue-500', value: scores.strategic },
      { key: 'doable', label: 'D', color: 'bg-green-500', value: scores.doable },
      { key: 'rewarding', label: 'R', color: 'bg-yellow-500', value: scores.rewarding },
      { key: 'sustainable', label: 'Su', color: 'bg-purple-500', value: scores.sustainable },
    ]
    const h = size === 'lg' ? 'h-24' : 'h-12'
    return (
      <div className="flex items-end gap-1">
        {dims.map(d => (
          <div key={d.key} className="flex flex-col items-center gap-0.5">
            <div className={`${h} w-6 bg-surface-hover rounded-t relative overflow-hidden`}>
              <div className={`${d.color} absolute bottom-0 w-full rounded-t transition-all`} style={{ height: `${d.value * 10}%` }} />
            </div>
            <span className="text-[9px] text-foreground-subtle">{d.label}</span>
            {size === 'lg' && <span className="text-[10px] font-bold text-foreground">{d.value}</span>}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">🚀 Pipeline</h1>
            <p className="text-foreground-muted">Ideas flow from opportunity to launch. Click scores to edit. Advance when thresholds are met.</p>
          </div>
          <button onClick={() => setShowNewOpportunity(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ New Opportunity</button>
        </div>
      </div>

      {/* River Visualization */}
      <div className="mb-8 p-6 bg-surface border border-border rounded-lg">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {(Object.entries(stageConfig) as [string, typeof stageConfig.opportunity][]).map(([stage, config]) => {
            const stageItems = getItemsByStage(stage as PipelineItem['stage'])
            return (
              <div key={stage} className="text-center cursor-pointer" onClick={() => setFilter(stage as any)}>
                <div className={`relative h-32 bg-background rounded-lg border border-border p-4 mb-2 hover:border-foreground-subtle transition-colors ${filter === stage ? 'ring-2 ring-blue-500/50' : ''}`}>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-surface px-2">
                    <span className="text-sm font-medium text-foreground">{config.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-full content-center">
                    {stageItems.slice(0, 12).map((item, i) => {
                      const brightness = item.sdsScore ? (item.sdsScore / 40) * 100 : 20
                      return (
                        <button key={i} onClick={(e) => { e.stopPropagation(); handleItemClick(item) }}
                          className={`w-2.5 h-2.5 rounded-full ${config.color} transition-all hover:scale-150`}
                          style={{ opacity: Math.max(brightness / 100, 0.2) }}
                          title={`${item.title} (SDS: ${item.sdsScore}) — Click to view details`} />
                      )
                    })}
                    {stageItems.length > 12 && <span className="text-xs text-foreground-subtle">+{stageItems.length - 12}</span>}
                  </div>
                </div>
                <span className="text-2xl font-bold text-foreground">{stageItems.length}</span>
              </div>
            )
          })}
        </div>

        {/* Threshold Legend */}
        <div className="flex items-center justify-center gap-8 text-xs text-foreground-subtle mb-4">
          <span>Opportunity → Idea: <strong className="text-blue-400">SDS ≥ 18</strong></span>
          <span>Idea → PRD: <strong className="text-purple-400">SDS ≥ 25</strong></span>
          <span>PRD → MVP: <strong className="text-green-400">SDS ≥ 30</strong></span>
        </div>

        {/* Velocity */}
        <div className="bg-background rounded-lg p-4 flex items-center justify-around text-sm">
          <div className="text-center"><span className="block text-2xl font-bold text-foreground">{velocity.ideasPerWeek}</span><span className="text-foreground-subtle">ideas/week</span></div>
          <div className="text-center"><span className="block text-2xl font-bold text-foreground">{velocity.hitRate}%</span><span className="text-foreground-subtle">hit rate</span></div>
          <div className="text-center"><span className="block text-2xl font-bold text-foreground">{velocity.avgTime}d</span><span className="text-foreground-subtle">avg time</span></div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-surface border border-border text-foreground-muted hover:text-foreground'}`}>All ({activeItems.length})</button>
        {(Object.entries(stageConfig) as [string, typeof stageConfig.opportunity][]).map(([stage, config]) => (
          <button key={stage} onClick={() => setFilter(stage as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === stage ? 'bg-blue-600 text-white' : 'bg-surface border border-border text-foreground-muted hover:text-foreground'}`}>
            {config.icon} {config.label} ({getItemsByStage(stage as any).length})
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {filteredItems.map(item => {
          const config = stageConfig[item.stage]
          const th = thresholds[item.stage]
          const qualifies = th ? item.sdsScore >= th.score : false
          const deficit = th ? Math.max(0, th.score - item.sdsScore) : 0
          const isEditing = editingItem === item.id
          const sdsColor = item.sdsScore >= 25 ? 'text-green-400' : item.sdsScore >= 18 ? 'text-yellow-400' : 'text-red-400'
          const sdsBgColor = item.sdsScore >= 25 ? 'bg-green-500/10 border-green-500/30' : item.sdsScore >= 18 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'

          return (
            <div key={item.id} className={`bg-surface border border-border rounded-lg overflow-hidden transition-all ${isEditing ? 'ring-2 ring-blue-500/50' : ''}`}>
              {/* Card Header */}
              <div className="p-6 cursor-pointer hover:bg-surface-hover/30 transition-colors" onClick={() => handleItemClick(item)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{config.icon}</span>
                      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-foreground-muted">
                      <span>Source: {item.source}</span>
                      {item.crisis && <span>Crisis: {item.crisis}</span>}
                      <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    {/* SDS Score Badge — click to expand breakdown */}
                    <button onClick={() => setExpandedSDS(expandedSDS === item.id ? null : item.id)}
                      className={`text-right rounded-lg px-3 py-2 border transition-colors ${sdsBgColor}`}
                      title="Click to view SDS breakdown">
                      <span className={`text-xl font-bold ${sdsColor}`}>{item.sdsScore.toFixed(1)}</span>
                      {th && (
                        <div className="text-xs mt-1">
                          {qualifies
                            ? <span className="text-emerald-400 font-medium">✓ Ready to advance</span>
                            : <span className="text-foreground-subtle">Needs {deficit.toFixed(1)} more</span>
                          }
                        </div>
                      )}
                    </button>
                    {/* Edit scores button */}
                    <button onClick={() => isEditing ? setEditingItem(null) : startEditing(item)}
                      className="text-xs text-foreground-subtle hover:text-foreground px-2 py-1 rounded border border-border"
                      title="Edit SDS scores">✏️</button>
                    {/* Mini bar chart - show based on score format */}
                    {item.sdsFormulaBreakdown ? (
                      <div className="flex items-end gap-0.5 h-8">
                        {(['revenue', 'alignment', 'leverage', 'timeFit', 'cognitiveLoad'] as const).map(key => (
                          <div key={key} className="flex flex-col items-center">
                            <div className="w-1.5 bg-surface-hover rounded-t relative overflow-hidden">
                              <div 
                                className={`${key === 'cognitiveLoad' ? 'bg-red-500' : 'bg-blue-500'} absolute bottom-0 w-full rounded-t`} 
                                style={{ height: `${((item.sdsFormulaBreakdown?.[key] ?? 0) / 5) * 100}%` }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : item.sdsBreakdown ? (
                      <SDSBarChart scores={item.sdsBreakdown} />
                    ) : null}
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${config.color} text-white`}>{config.label.slice(0, -1)}</span>
                    {/* Archive button */}
                    {item.stage !== 'archived' && (
                      <button onClick={() => setArchiveConfirm(item.id)}
                        className="text-xs text-foreground-subtle hover:text-red-400 px-2 py-1 rounded border border-border"
                        title="Archive this item">📦</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable SDS Breakdown */}
              {expandedSDS === item.id && !isEditing && (
                <div className="px-6 pb-4 border-t border-border">
                  <div className="pt-3 flex items-center gap-6 text-sm">
                    {item.sdsFormulaBreakdown ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-3">
                          {item.sdsFormulaBreakdown.revenue !== undefined && <span>Revenue: <strong>{item.sdsFormulaBreakdown.revenue}</strong></span>}
                          {item.sdsFormulaBreakdown.alignment !== undefined && <span>Alignment: <strong>{item.sdsFormulaBreakdown.alignment}</strong></span>}
                          {item.sdsFormulaBreakdown.leverage !== undefined && <span>Leverage: <strong>{item.sdsFormulaBreakdown.leverage}</strong></span>}
                          {item.sdsFormulaBreakdown.timeFit !== undefined && <span>Time Fit: <strong>{item.sdsFormulaBreakdown.timeFit}</strong></span>}
                          {item.sdsFormulaBreakdown.cognitiveLoad !== undefined && <span>Cog Load: <strong className="text-red-400">-{item.sdsFormulaBreakdown.cognitiveLoad}</strong></span>}
                        </div>
                        {item.sdsFormulaBreakdown.formula && <div className="text-xs text-foreground-subtle font-mono">{item.sdsFormulaBreakdown.formula}</div>}
                      </div>
                    ) : item.sdsBreakdown ? (
                      <div className="flex gap-4">
                        <span>Strategic: <strong>{item.sdsBreakdown.strategic}</strong></span>
                        <span>Doable: <strong>{item.sdsBreakdown.doable}</strong></span>
                        <span>Rewarding: <strong>{item.sdsBreakdown.rewarding}</strong></span>
                        <span>Sustainable: <strong>{item.sdsBreakdown.sustainable}</strong></span>
                      </div>
                    ) : (
                      <span className="text-foreground-subtle">No breakdown available</span>
                    )}
                    {th && (
                      <span className="ml-auto text-xs text-foreground-subtle">
                        Advance threshold: <strong>{th.score}</strong> → {th.next.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Inline SDS Editor */}
              {isEditing && (
                <div className="px-6 pb-6 border-t border-border">
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-foreground">SDS Score Breakdown</h4>
                      <div className="text-xs text-foreground-subtle">
                        {useFormulaScores ? (
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Formula System (6-dim)</span>
                        ) : (
                          <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Legacy System (4-dim)</span>
                        )}
                      </div>
                    </div>
                    
                    {useFormulaScores ? (
                      // Formula-based scoring editor (new 6-dimension)
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          {([
                            { key: 'revenue' as const, label: 'Revenue Potential', desc: 'Monetization ceiling', color: 'accent-green-500' },
                            { key: 'alignment' as const, label: 'Strategic Alignment', desc: 'Mission fit', color: 'accent-blue-500' },
                            { key: 'leverage' as const, label: 'Leverage', desc: 'Multiplies existing work', color: 'accent-yellow-500' },
                            { key: 'timeFit' as const, label: 'Time Fit', desc: 'Right timing', color: 'accent-purple-500' },
                            { key: 'cognitiveLoad' as const, label: 'Cognitive Load', desc: 'Team burden (lower = better)', color: 'accent-red-500', inverted: true },
                          ]).map(dim => (
                            <div key={dim.key}>
                              <div className="flex justify-between mb-1">
                                <label className="text-sm text-foreground">{dim.label}</label>
                                <span className="text-sm font-bold text-foreground">{editFormulaScores[dim.key]}</span>
                              </div>
                              <input type="range" min="1" max="5" value={editFormulaScores[dim.key]}
                                onChange={e => setEditFormulaScores({ ...editFormulaScores, [dim.key]: parseInt(e.target.value) })}
                                className={`w-full ${dim.color}`} />
                              <p className="text-xs text-foreground-subtle">{dim.desc}</p>
                            </div>
                          ))}
                        </div>

                        {/* Score visualization for formula scores */}
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex items-end gap-2 mb-4">
                            {(['revenue', 'alignment', 'leverage', 'timeFit', 'cognitiveLoad'] as const).map(key => (
                              <div key={key} className="flex flex-col items-center">
                                <div className="w-8 h-24 bg-surface-hover rounded-t relative overflow-hidden">
                                  <div 
                                    className={`${key === 'cognitiveLoad' ? 'bg-red-500' : 'bg-blue-500'} absolute bottom-0 w-full rounded-t transition-all`} 
                                    style={{ height: `${((editFormulaScores[key] ?? 0) / 5) * 100}%` }} 
                                  />
                                </div>
                                <span className="text-[10px] text-foreground-subtle mt-1">{editFormulaScores[key] ?? 0}</span>
                              </div>
                            ))}
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-foreground">{calculateFormulaSDS(editFormulaScores).toFixed(1)}</div>
                            <div className="text-sm text-foreground-subtle">Total SDS Score</div>
                            <div className="text-xs text-foreground-subtle font-mono mt-1">
                              ({editFormulaScores.revenue}×2)+({editFormulaScores.alignment}×2)+({editFormulaScores.leverage}×1.5)+({editFormulaScores.timeFit}×1)-({editFormulaScores.cognitiveLoad}×1)
                            </div>
                            {th && (
                              <div className={`mt-2 text-sm font-medium ${calculateFormulaSDS(editFormulaScores) >= th.score ? 'text-emerald-400' : 'text-foreground-subtle'}`}>
                                {calculateFormulaSDS(editFormulaScores) >= th.score
                                  ? `✓ Qualifies for ${th.next.toUpperCase()}`
                                  : `Need ${(th.score - calculateFormulaSDS(editFormulaScores)).toFixed(1)} more for ${th.next.toUpperCase()}`
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Legacy scoring editor (4-dimension)
                      <div className="grid grid-cols-2 gap-6">
                        {/* Sliders */}
                        <div className="space-y-4">
                          {([
                            { key: 'strategic' as const, label: 'Strategic', desc: 'Mission alignment', color: 'accent-blue-500' },
                            { key: 'doable' as const, label: 'Doable', desc: 'Realistic to execute', color: 'accent-green-500' },
                            { key: 'rewarding' as const, label: 'Rewarding', desc: 'Moves the needle', color: 'accent-yellow-500' },
                            { key: 'sustainable' as const, label: 'Sustainable', desc: 'No burnout risk', color: 'accent-purple-500' },
                          ]).map(dim => (
                            <div key={dim.key}>
                              <div className="flex justify-between mb-1">
                                <label className="text-sm text-foreground">{dim.label}</label>
                                <span className="text-sm font-bold text-foreground">{editScores[dim.key]}</span>
                              </div>
                              <input type="range" min="0" max="10" value={editScores[dim.key]}
                                onChange={e => setEditScores({ ...editScores, [dim.key]: parseInt(e.target.value) })}
                                className={`w-full ${dim.color}`} />
                              <p className="text-xs text-foreground-subtle">{dim.desc}</p>
                            </div>
                          ))}
                        </div>

                        {/* Score visualization */}
                        <div className="flex flex-col items-center justify-center">
                          <SDSBarChart scores={editScores} size="lg" />
                          <div className="mt-4 text-center">
                            <div className="text-3xl font-bold text-foreground">{calculateSDS(editScores).toFixed(1)}</div>
                            <div className="text-sm text-foreground-subtle">Total SDS Score</div>
                            {th && (
                              <div className={`mt-2 text-sm font-medium ${calculateSDS(editScores) >= th.score ? 'text-emerald-400' : 'text-foreground-subtle'}`}>
                                {calculateSDS(editScores) >= th.score
                                  ? `✓ Qualifies for ${th.next.toUpperCase()}`
                                  : `Need ${(th.score - calculateSDS(editScores)).toFixed(1)} more for ${th.next.toUpperCase()}`
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
                      <button onClick={() => saveScores(item.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Save Scores</button>
                      <button onClick={() => setEditingItem(null)} className="px-4 py-2 bg-surface border border-border text-foreground-muted rounded-lg text-sm">Cancel</button>
                      <button onClick={() => handleItemClick(item)} className="px-4 py-2 bg-surface border border-border text-foreground-muted rounded-lg text-sm hover:text-foreground">View PRD / Details →</button>
                      {th && ((useFormulaScores && calculateFormulaSDS(editFormulaScores) >= th.score) || (!useFormulaScores && calculateSDS(editScores) >= th.score)) && (
                        <button onClick={() => setAdvanceConfirm(item.id)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm ml-auto">
                          🚀 Advance to {th.next.toUpperCase()}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-foreground-subtle">
          <p className="mb-4">No items in this stage yet</p>
          {filter === 'opportunity' && (
            <button onClick={() => setShowNewOpportunity(true)} className="text-blue-400 hover:underline">Add the first opportunity</button>
          )}
        </div>
      )}

      {/* Advance Confirmation */}
      {advanceConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2 text-foreground">🚀 Advance Item?</h3>
            {(() => {
              const item = items.find(i => i.id === advanceConfirm)
              const th = item ? thresholds[item.stage] : null
              return (
                <p className="text-foreground-muted mb-4">
                  Move &quot;{item?.title}&quot; from {item?.stage.toUpperCase()} to {th?.next.toUpperCase()}?
                </p>
              )
            })()}
            <div className="flex justify-end gap-3">
              <button onClick={() => setAdvanceConfirm(null)} className="px-4 py-2 text-foreground-muted">Cancel</button>
              <button onClick={() => advanceItem(advanceConfirm)} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Advance</button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation */}
      {archiveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2 text-foreground">📦 Archive Item?</h3>
            {(() => {
              const item = items.find(i => i.id === archiveConfirm)
              return (
                <p className="text-foreground-muted mb-4">
                  Archive &quot;{item?.title}&quot;? It will be hidden from the default view but can be found under the Archived filter.
                </p>
              )
            })()}
            <div className="flex justify-end gap-3">
              <button onClick={() => setArchiveConfirm(null)} className="px-4 py-2 text-foreground-muted">Cancel</button>
              <button onClick={() => archiveItem(archiveConfirm)} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Archive</button>
            </div>
          </div>
        </div>
      )}

      {/* New Opportunity Modal */}
      {showNewOpportunity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-foreground">New Opportunity</h3>
            <p className="text-sm text-foreground-muted mb-4">Opportunities are captured through continuous monitoring.</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowNewOpportunity(false); router.push('/monitoring') }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Go to Monitoring</button>
              <button onClick={() => setShowNewOpportunity(false)}
                className="flex-1 px-4 py-2 bg-surface border border-border text-foreground-muted rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
