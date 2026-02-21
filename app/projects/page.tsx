'use client'

import { useEffect, useState, useCallback } from 'react'
import { Project, ProjectStatus, Priority } from '@/lib/types'
import ProjectModal from '@/components/projects/ProjectModal'

type Phase = 'planning' | 'building' | 'testing' | 'live'

interface ProjectWithPhase extends Project {
  phase?: Phase
}

const phaseColumns = [
  { key: 'planning' as Phase, label: '📐 Planning', color: 'border-blue-500/50' },
  { key: 'building' as Phase, label: '🏗 Building', color: 'border-yellow-500/50' },
  { key: 'testing' as Phase, label: '🧪 Testing', color: 'border-purple-500/50' },
  { key: 'live' as Phase, label: '🟢 Live', color: 'border-emerald-500/50' },
]

const STATUS_FILTERS: (ProjectStatus | 'All')[] = [
  'All', '💡 Idea / Brainstorming', '🔬 Research & Discovery', '📐 Architecture & Planning',
  '🏗 In Development', '🧪 Testing / Review', '✅ Completed', '⏸️ Paused', '🗄 Archived',
]
const PRIORITY_FILTERS: (Priority | 'All')[] = ['All', '🔴 Critical', '🟠 High', '🟡 Medium', '🟢 Low']

function statusToPhase(status: ProjectStatus): Phase {
  if (status.includes('Idea') || status.includes('Research') || status.includes('Architecture') || status.includes('Planning')) return 'planning'
  if (status.includes('Development')) return 'building'
  if (status.includes('Testing') || status.includes('Review')) return 'testing'
  if (status.includes('Completed')) return 'live'
  return 'planning'
}

function logInteraction(action: string, itemId: string, details?: Record<string, unknown>) {
  fetch('/api/projects/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, itemId, ...details })
  }).catch(() => {})
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithPhase[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'phase-board' | 'list'>('phase-board')
  const [modalOpen, setModalOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [dragItem, setDragItem] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  // Phase overrides stored client-side (keyed by project id)
  const [phaseOverrides, setPhaseOverrides] = useState<Record<string, Phase>>({})

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data: Project[] = await res.json()
        const withPhase: ProjectWithPhase[] = data.map(p => ({
          ...p,
          phase: phaseOverrides[p.id] || statusToPhase(p.status)
        }))
        setProjects(withPhase)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const moveToPhase = useCallback(async (projectId: string, newPhase: Phase) => {
    const project = projects.find(p => p.id === projectId)
    if (!project || project.phase === newPhase) return

    const oldPhase = project.phase
    setPhaseOverrides(prev => ({ ...prev, [projectId]: newPhase }))
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, phase: newPhase } : p))

    logInteraction('phase_change', projectId, { from: oldPhase, to: newPhase, title: project.name })
  }, [projects])

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragItem(id)
    e.dataTransfer.effectAllowed = 'move'
    logInteraction('drag_start', id)
  }
  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverCol(colKey)
  }
  const handleDragLeave = () => setDragOverCol(null)
  const handleDrop = (e: React.DragEvent, colKey: string) => {
    e.preventDefault(); setDragOverCol(null)
    if (dragItem) { moveToPhase(dragItem, colKey as Phase); setDragItem(null) }
  }

  async function handleSave(projectData: Partial<Project>) {
    if (editProject) {
      await fetch('/api/projects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editProject.id, ...projectData }) })
    } else {
      await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(projectData) })
    }
    fetchProjects(); setEditProject(null)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/projects?id=${id}`, { method: 'DELETE' })
    setDeleteId(null); fetchProjects()
  }

  const filteredProjects = projects.filter(p => {
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter
    const matchesPriority = priorityFilter === 'All' || p.priority === priorityFilter
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.vision.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesStatus && matchesPriority && matchesSearch
  })

  if (loading) return <div className="p-8"><h1 className="text-2xl font-bold mb-2">Projects Hub</h1><p className="text-foreground-muted">Loading...</p></div>

  return (
    <div className="p-8 max-w-full mx-auto">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">📁 Projects Hub</h1>
          <p className="text-foreground-muted">{projects.length} project{projects.length !== 1 ? 's' : ''} — drag between phases to update.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('phase-board')} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${view === 'phase-board' ? 'bg-blue-600 text-white' : 'bg-surface border border-border text-foreground-muted hover:text-foreground'}`}>▦ Phase Board</button>
          <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-surface border border-border text-foreground-muted hover:text-foreground'}`}>☰ List</button>
          <button onClick={() => { setEditProject(null); setModalOpen(true) }} className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700">+ New</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {phaseColumns.map(col => (
          <div key={col.key} className="bg-surface border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{projects.filter(p => p.phase === col.key).length}</div>
            <div className="text-xs text-foreground-subtle">{col.label}</div>
          </div>
        ))}
      </div>

      {/* PHASE BOARD VIEW */}
      {view === 'phase-board' && (
        <div className="grid grid-cols-4 gap-3 min-h-[500px]">
          {phaseColumns.map(col => {
            const colItems = projects.filter(p => p.phase === col.key)
            const isOver = dragOverCol === col.key
            return (
              <div key={col.key} onDragOver={(e) => handleDragOver(e, col.key)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, col.key)}
                className={`rounded-lg border-2 border-dashed p-3 transition-colors ${isOver ? 'border-blue-500 bg-blue-500/10' : col.color + ' bg-surface/50'}`}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                  <span className="text-xs bg-surface border border-border rounded-full px-2 py-0.5 text-foreground-muted">{colItems.length}</span>
                </div>
                <div className="space-y-2">
                  {colItems.map(project => (
                    <div key={project.id} draggable onDragStart={(e) => handleDragStart(e, project.id)}
                      onClick={() => { setExpandedItem(expandedItem === project.id ? null : project.id); logInteraction('item_click', project.id, { title: project.name }) }}
                      className={`bg-surface border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-foreground-subtle transition-all ${dragItem === project.id ? 'opacity-50 scale-95' : ''} ${expandedItem === project.id ? 'ring-2 ring-blue-500/50' : ''}`}>
                      <h4 className="text-sm font-medium text-foreground truncate">{project.name}</h4>
                      {project.codename && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-foreground-subtle">{project.codename}</span>}
                      <p className="text-xs text-foreground-muted mt-1 line-clamp-2">{project.vision}</p>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-foreground-subtle">
                        <span>{project.priority}</span>
                        <span>{project.last_active}</span>
                      </div>
                      {expandedItem === project.id && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="text-xs text-foreground-muted mb-1"><span className="font-medium text-foreground">Status:</span> {project.status}</div>
                          <div className="text-xs text-foreground-muted mb-1"><span className="font-medium text-foreground">Category:</span> {project.category}</div>
                          {project.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap mt-2">
                              {project.tags.map(tag => <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-foreground-subtle">#{tag}</span>)}
                            </div>
                          )}
                          <div className="mt-2 flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); setEditProject(project); setModalOpen(true) }} className="text-[10px] px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30">Edit</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {colItems.length === 0 && <div className="text-xs text-foreground-subtle text-center py-8 italic">Drop projects here</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <>
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <input type="text" placeholder="Search projects..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="bg-surface border border-border rounded px-3 py-2 w-64 text-foreground" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ProjectStatus | 'All')} className="bg-surface border border-border rounded px-3 py-2 text-foreground">
              {STATUS_FILTERS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as Priority | 'All')} className="bg-surface border border-border rounded px-3 py-2 text-foreground">
              {PRIORITY_FILTERS.map(p => <option key={p} value={p}>{p === 'All' ? 'All Priority' : p}</option>)}
            </select>
            {(statusFilter !== 'All' || priorityFilter !== 'All' || searchQuery) && (
              <button onClick={() => { setStatusFilter('All'); setPriorityFilter('All'); setSearchQuery('') }} className="text-foreground-subtle hover:text-foreground text-sm">Clear filters</button>
            )}
          </div>

          {filteredProjects.length === 0 ? (
            <div className="bg-surface border border-border rounded-lg p-12 text-center">
              <p className="text-4xl mb-4">📁</p>
              <p className="text-lg font-medium mb-2 text-foreground">{projects.length === 0 ? 'No projects yet' : 'No matching projects'}</p>
              <p className="text-sm text-foreground-subtle">{projects.length === 0 ? 'Create your first project' : 'Try adjusting filters'}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProjects.map(project => (
                <div key={project.id} className="bg-surface border border-border rounded-lg p-4 hover:border-foreground-subtle transition-colors group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-lg text-foreground">{project.name}</h3>
                        {project.codename && <span className="text-xs px-2 py-0.5 bg-secondary rounded text-foreground-subtle">{project.codename}</span>}
                      </div>
                      <p className="text-foreground-muted mb-3">{project.vision}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-secondary rounded text-foreground-subtle">{project.status}</span>
                        <span className="px-2 py-1 bg-secondary rounded text-foreground-subtle">{project.priority}</span>
                        <span className="px-2 py-1 bg-secondary rounded text-foreground-subtle">{project.category}</span>
                        {project.tags.map(tag => <span key={tag} className="px-2 py-1 bg-secondary rounded text-foreground-subtle">#{tag}</span>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditProject(project); setModalOpen(true) }} className="px-3 py-1 text-sm bg-secondary hover:bg-surface-hover/50 rounded text-foreground-muted">Edit</button>
                      <button onClick={() => setDeleteId(project.id)} className="px-3 py-1 text-sm bg-red-900/50 hover:bg-red-900 text-red-200 rounded">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-bold mb-2 text-foreground">Delete Project?</h3>
            <p className="text-foreground-muted mb-4">This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-foreground-muted hover:text-foreground">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      <ProjectModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditProject(null) }} onSave={handleSave} editProject={editProject} />
    </div>
  )
}
