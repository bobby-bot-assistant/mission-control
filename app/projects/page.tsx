'use client'

import { useEffect, useState } from 'react'
import { Project, ProjectStatus, Priority } from '@/lib/types'
import ProjectModal from '@/components/projects/ProjectModal'

const STATUS_FILTERS: (ProjectStatus | 'All')[] = [
  'All',
  '💡 Idea / Brainstorming',
  '🔬 Research & Discovery',
  '📐 Architecture & Planning',
  '🏗 In Development',
  '🧪 Testing / Review',
  '✅ Completed',
  '⏸️ Paused',
  '🗄 Archived',
]

const PRIORITY_FILTERS: (Priority | 'All')[] = [
  'All',
  '🔴 Critical',
  '🟠 High',
  '🟡 Medium',
  '🟢 Low',
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  async function handleSave(projectData: Partial<Project>) {
    if (editProject) {
      // Update existing project
      await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editProject.id, ...projectData }),
      })
    } else {
      // Create new project
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      })
    }
    fetchProjects()
    setEditProject(null)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/projects?id=${id}`, { method: 'DELETE' })
    setDeleteId(null)
    fetchProjects()
  }

  function openCreateModal() {
    setEditProject(null)
    setModalOpen(true)
  }

  function openEditModal(project: Project) {
    setEditProject(project)
    setModalOpen(true)
  }

  const filteredProjects = projects.filter(p => {
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter
    const matchesPriority = priorityFilter === 'All' || p.priority === priorityFilter
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vision.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesStatus && matchesPriority && matchesSearch
  })

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Projects Hub</h1>
        <p className="text-zinc-500">Loading projects...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Projects Hub</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + New Project
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 w-64 text-zinc-900 dark:text-zinc-100"
        />
        
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as ProjectStatus | 'All')}
          className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-zinc-900 dark:text-zinc-100"
        >
          {STATUS_FILTERS.map(status => (
            <option key={status} value={status}>
              {status === 'All' ? 'All Status' : status}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value as Priority | 'All')}
          className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-zinc-900 dark:text-zinc-100"
        >
          {PRIORITY_FILTERS.map(priority => (
            <option key={priority} value={priority}>
              {priority === 'All' ? 'All Priority' : priority}
            </option>
          ))}
        </select>

        {(statusFilter !== 'All' || priorityFilter !== 'All' || searchQuery) && (
          <button
            onClick={() => {
              setStatusFilter('All')
              setPriorityFilter('All')
              setSearchQuery('')
            }}
            className="text-zinc-400 hover:text-zinc-200 text-sm"
          >
            Clear filters
          </button>
        )}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <p className="text-4xl mb-4">📁</p>
          <p className="text-lg font-medium mb-2">
            {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {projects.length === 0 
              ? 'Create your first project to get started'
              : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <div 
              key={project.id}
              className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-lg">{project.name}</h3>
                    {project.codename && (
                      <span className="text-xs px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-zinc-700 dark:text-zinc-400">
                        {project.codename}
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-3">{project.vision}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-700 dark:text-zinc-300">{project.status}</span>
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-700 dark:text-zinc-300">{project.priority}</span>
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-700 dark:text-zinc-300">{project.category}</span>
                    {project.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(project)}
                    className="px-3 py-1 text-sm bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded text-zinc-800 dark:text-zinc-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(project.id)}
                    className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-200 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 max-w-md">
            <h3 className="text-lg font-bold mb-2">Delete Project?</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditProject(null)
        }}
        onSave={handleSave}
        editProject={editProject}
      />
    </div>
  )
}
