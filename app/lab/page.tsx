'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface LabItem {
  id: string
  title: string
  description: string
  type: 'prototype' | 'tool' | 'improvement' | 'experiment' | 'proposal'
  status: 'ready-to-test' | 'in-progress' | 'tested' | 'shipped' | 'archived'
  builtBy: string
  builtDate: string
  testedDate?: string
  notes?: string
  testUrl?: string
  testUrlLabel?: string
  priority: 'high' | 'medium' | 'low'
  tags: string[]
}

const typeEmoji: Record<string, string> = {
  'prototype': '🧪',
  'tool': '🔧',
  'improvement': '✨',
  'experiment': '🔬',
  'proposal': '💡'
}

const columns = [
  { key: 'ready-to-test', label: '🟢 Ready to Test', color: 'border-green-500/50' },
  { key: 'in-progress', label: '🔵 In Progress', color: 'border-blue-500/50' },
  { key: 'tested', label: '🟣 Tested', color: 'border-purple-500/50' },
  { key: 'shipped', label: '✅ Shipped', color: 'border-emerald-500/50' },
  { key: 'archived', label: '📦 Archived', color: 'border-border' },
]

const statusColors: Record<string, string> = {
  'ready-to-test': 'bg-green-500/20 text-green-300 border-green-500/30',
  'in-progress': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'tested': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'shipped': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'archived': 'bg-background-subtle/20 text-foreground-muted border-border-subtle'
}

function logInteraction(action: string, itemId: string, details?: Record<string, any>) {
  fetch('/api/lab/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, itemId, ...details })
  }).catch(() => {})
}

export default function LabPage() {
  const [items, setItems] = useState<LabItem[]>([])
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [filter, setFilter] = useState<string>('all')
  const [dragItem, setDragItem] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/lab')
      .then(res => res.json())
      .then(data => { setItems(data); logInteraction('page_view', 'lab', { itemCount: data.length }) })
      .catch(() => setItems([]))
  }, [])

  const moveItem = useCallback(async (itemId: string, newStatus: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item || item.status === newStatus) return

    const oldStatus = item.status
    const updated = { ...item, status: newStatus as LabItem['status'] }
    
    // Optimistic update
    setItems(prev => prev.map(i => i.id === itemId ? updated : i))

    // Persist
    await fetch('/api/lab', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId, status: newStatus })
    })

    // Log interaction
    logInteraction('status_change', itemId, { 
      from: oldStatus, 
      to: newStatus, 
      title: item.title 
    })
  }, [items])

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDragItem(itemId)
    e.dataTransfer.effectAllowed = 'move'
    logInteraction('drag_start', itemId)
  }

  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(colKey)
  }

  const handleDragLeave = () => setDragOverCol(null)

  const handleDrop = (e: React.DragEvent, colKey: string) => {
    e.preventDefault()
    setDragOverCol(null)
    if (dragItem) {
      moveItem(dragItem, colKey)
      setDragItem(null)
    }
  }

  const handleItemClick = (itemId: string) => {
    const isExpanding = expandedItem !== itemId
    setExpandedItem(isExpanding ? itemId : null)
    if (isExpanding) {
      const item = items.find(i => i.id === itemId)
      logInteraction('item_click', itemId, { title: item?.title })
    }
  }

  const readyCount = items.filter(i => i.status === 'ready-to-test').length
  const inProgressCount = items.filter(i => i.status === 'in-progress').length

  // List view filtering
  const filteredItems = filter === 'all'
    ? items.filter(i => i.status !== 'archived')
    : items.filter(i => i.status === filter)

  return (
    <div className="p-8 max-w-full mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🔬 R&D Lab</h1>
            <p className="text-foreground-muted">
              Prototypes, tools, and experiments. Drag items between columns to update status.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                view === 'kanban' ? 'bg-blue-600 text-white' : 'bg-surface border border-border text-foreground-muted hover:text-foreground'
              }`}
            >
              ▦ Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                view === 'list' ? 'bg-blue-600 text-white' : 'bg-surface border border-border text-foreground-muted hover:text-foreground'
              }`}
            >
              ☰ List
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{readyCount}</div>
          <div className="text-xs text-foreground-subtle">Ready to Test</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{inProgressCount}</div>
          <div className="text-xs text-foreground-subtle">In Progress</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{items.filter(i => i.status === 'tested').length}</div>
          <div className="text-xs text-foreground-subtle">Tested</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{items.filter(i => i.status === 'shipped').length}</div>
          <div className="text-xs text-foreground-subtle">Shipped</div>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {view === 'kanban' && (
        <div className="grid grid-cols-5 gap-3 min-h-[500px]">
          {columns.map(col => {
            const colItems = items.filter(i => i.status === col.key)
            const isOver = dragOverCol === col.key
            return (
              <div
                key={col.key}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.key)}
                className={`rounded-lg border-2 border-dashed p-3 transition-colors ${
                  isOver ? 'border-blue-500 bg-blue-500/10' : col.color + ' bg-surface/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                  <span className="text-xs bg-surface border border-border rounded-full px-2 py-0.5 text-foreground-muted">
                    {colItems.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {colItems.map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onClick={() => handleItemClick(item.id)}
                      className={`bg-surface border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-foreground-subtle transition-all ${
                        dragItem === item.id ? 'opacity-50 scale-95' : ''
                      } ${expandedItem === item.id ? 'ring-2 ring-blue-500/50' : ''}`}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-lg">{typeEmoji[item.type] || '📦'}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">{item.title}</h4>
                          <p className="text-xs text-foreground-muted mt-0.5 line-clamp-2">{item.description}</p>
                        </div>
                      </div>
                      {item.priority === 'high' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          High
                        </span>
                      )}
                      <div className="flex items-center justify-between mt-2 text-[10px] text-foreground-subtle">
                        <span>{item.builtBy}</span>
                        <span>{item.builtDate}</span>
                      </div>
                      
                      {/* Expanded details */}
                      {expandedItem === item.id && (
                        <div className="mt-3 pt-3 border-t border-border">
                          {item.testUrl && (
                            <a
                              href={item.testUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.stopPropagation()
                                logInteraction('test_url_click', item.id, { url: item.testUrl })
                              }}
                              className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                            >
                              🔗 {item.testUrlLabel || 'Open & Test'} →
                            </a>
                          )}
                          {item.notes && (
                            <div className="text-xs text-foreground-muted bg-background-subtle rounded p-2 mb-2">
                              <span className="font-medium text-foreground">Notes:</span> {item.notes}
                            </div>
                          )}
                          {item.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {item.tags.map(tag => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-foreground-subtle">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {colItems.length === 0 && (
                    <div className="text-xs text-foreground-subtle text-center py-8 italic">
                      Drop items here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <>
          <div className="flex gap-2 mb-6 flex-wrap">
            {['all', 'ready-to-test', 'in-progress', 'tested', 'shipped', 'archived'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-surface border border-border text-foreground-muted hover:text-foreground'
                }`}
              >
                {f === 'all' ? '📋 All Active' : columns.find(c => c.key === f)?.label || f}
              </button>
            ))}
          </div>
          {filteredItems.length === 0 ? (
            <div className="bg-surface border border-border rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-lg font-medium mb-2 text-foreground">Lab is empty</h3>
              <p className="text-foreground-subtle text-sm">
                {filter === 'all'
                  ? "Nothing staged yet. Daisy's nightly builds will appear here."
                  : `No items with status "${filter}".`}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="bg-surface border border-border rounded-lg p-5 hover:border-foreground-subtle transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{typeEmoji[item.type] || '📦'}</span>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[item.status]}`}>
                            {columns.find(c => c.key === item.status)?.label}
                          </span>
                          <span className="text-xs text-foreground-subtle">
                            {item.type} · Built by {item.builtBy} · {item.builtDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    {item.priority === 'high' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        High Priority
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground-muted mb-3">{item.description}</p>
                  {expandedItem === item.id && (
                    <div className="mb-3 space-y-2">
                      {item.testUrl && (
                        <a
                          href={item.testUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.stopPropagation()
                            logInteraction('test_url_click', item.id, { url: item.testUrl })
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                        >
                          🔗 {item.testUrlLabel || 'Open & Test'} →
                        </a>
                      )}
                      {item.notes && (
                        <div className="text-xs text-foreground-muted bg-background-subtle rounded p-3">
                          <span className="font-medium text-foreground">Notes:</span> {item.notes}
                        </div>
                      )}
                    </div>
                  )}
                  {item.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded bg-secondary text-foreground-subtle">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
