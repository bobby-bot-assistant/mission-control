'use client'

import { useEffect, useState } from 'react'
import { Task, TaskStatus, Priority, Project } from '@/lib/types'
import TaskModal from '@/components/tasks/TaskModal'

const STATUS_COLUMNS: TaskStatus[] = [
  '📥 Backlog (captured but not started)',
  '🎯 Up Next (queued for soon)',
  '🔄 In Progress (actively working)',
  '👀 Review / Waiting (blocked or needs input)',
  '✅ Completed',
]

const PRIORITY_FILTERS: (Priority | 'All')[] = [
  'All',
  '🔴 Critical',
  '🟠 High',
  '🟡 Medium',
  '🟢 Low',
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All')
  const [projectFilter, setProjectFilter] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')
  const [searchQuery, setSearchQuery] = useState('')

  async function fetchTasks() {
    try {
      const url = searchQuery 
        ? `/api/tasks?q=${encodeURIComponent(searchQuery)}`
        : '/api/tasks'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchProjects()
  }, [searchQuery])

  async function handleSave(taskData: Partial<Task>) {
    if (editTask) {
      // Update existing task
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editTask.id, ...taskData }),
      })
    } else {
      // Create new task
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })
    }
    fetchTasks()
    setEditTask(null)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
    setDeleteId(null)
    fetchTasks()
  }

  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    const updates: Partial<Task> = { status: newStatus }
    if (newStatus === '✅ Completed') {
      updates.completed_date = new Date().toISOString().split('T')[0]
    }

    await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId, ...updates }),
    })
    fetchTasks()
  }

  function openCreateModal() {
    setEditTask(null)
    setModalOpen(true)
  }

  function openEditModal(task: Task) {
    setEditTask(task)
    setModalOpen(true)
  }

  const filteredTasks = tasks.filter(t => {
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter
    const matchesProject = projectFilter === 'All' || t.related_project_id === projectFilter
    return matchesPriority && matchesProject
  })

  const getProjectName = (projectId?: string) => {
    if (!projectId) return undefined
    const project = projects.find(p => p.id === projectId)
    return project?.name
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Tasks Command Center</h1>
        <p className="text-foreground-muted">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Tasks Command Center</h1>
          <p className="text-foreground-muted">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-hover rounded-lg p-1">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'board' ? 'bg-background-subtle text-foreground dark:text-white' : 'text-foreground-muted'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'list' ? 'bg-background-subtle text-foreground dark:text-white' : 'text-foreground-muted'
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-surface border border-border rounded px-3 py-2 w-64 text-foreground"
        />
        
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value as Priority | 'All')}
          className="bg-surface border border-border rounded px-3 py-2 text-foreground"
        >
          {PRIORITY_FILTERS.map(priority => (
            <option key={priority} value={priority}>
              {priority === 'All' ? 'All Priorities' : priority}
            </option>
          ))}
        </select>

        <select
          value={projectFilter}
          onChange={e => setProjectFilter(e.target.value)}
          className="bg-surface border border-border rounded px-3 py-2 text-foreground"
        >
          <option value="All">All Projects</option>
          <option value="">No Project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>

        {(priorityFilter !== 'All' || projectFilter !== 'All' || searchQuery) && (
          <button
            onClick={() => {
              setPriorityFilter('All')
              setProjectFilter('All')
              setSearchQuery('')
            }}
            className="text-foreground-subtle hover:text-foreground text-sm"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-5 gap-4 h-screen">
          {STATUS_COLUMNS.map((status) => {
            const statusTasks = filteredTasks.filter(t => t.status === status)
            return (
              <div key={status} className="bg-surface rounded-lg border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-sm">{status.split(' ')[0]} {status.split(' ')[1]}</h3>
                  <span className="bg-secondary text-xs px-2 py-1 rounded">{statusTasks.length}</span>
                </div>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                  {statusTasks.map(task => (
                    <div
                      key={task.id}
                      className="bg-background-subtle rounded-lg p-3 group hover:bg-surface-hover transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                        <span className="text-xs px-1.5 py-0.5 bg-background-subtle rounded shrink-0">
                          {task.priority.split(' ')[0]}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-foreground-muted mb-2 line-clamp-2">{task.description}</p>
                      )}
                      {getProjectName(task.related_project_id) && (
                        <p className="text-xs text-blue-400 mb-2">📁 {getProjectName(task.related_project_id)}</p>
                      )}
                      {task.due_date && (
                        <p className="text-xs text-yellow-400 mb-2">
                          📅 Due {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                          className="text-xs bg-surface border border-border rounded px-2 py-1 text-foreground"
                        >
                          {STATUS_COLUMNS.map(status => (
                            <option key={status} value={status}>
                              {status.split(' ')[0]}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditModal(task)}
                            className="text-xs px-2 py-1 bg-surface-hover hover:bg-background-subtle rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(task.id)}
                            className="text-xs px-2 py-1 bg-red-900/50 hover:bg-red-900 text-red-200 rounded"
                          >
                            Del
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-background-subtle rounded-lg border border-border p-12 text-center">
              <p className="text-4xl mb-4">📋</p>
              <p className="text-lg font-medium mb-2">
                {tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
              </p>
              <p className="text-sm text-foreground-muted">
                {tasks.length === 0 
                  ? 'Create your first task to get started'
                  : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div 
                key={task.id}
                className="bg-background-subtle rounded-lg border border-border p-4 hover:border-border-subtle transition-colors group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-lg">{task.title}</h3>
                      <span className="text-xs px-2 py-0.5 bg-surface-hover rounded">{task.status}</span>
                      <span className="text-xs px-2 py-0.5 bg-surface-hover rounded">{task.priority}</span>
                    </div>
                    
                    {task.description && (
                      <p className="text-foreground-subtle mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 text-xs">
                      {getProjectName(task.related_project_id) && (
                        <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded">
                          📁 {getProjectName(task.related_project_id)}
                        </span>
                      )}
                      {task.due_date && (
                        <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {task.completed_date && (
                        <span className="px-2 py-1 bg-green-900/30 text-green-300 rounded">
                          Completed: {new Date(task.completed_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(task)}
                      className="px-3 py-1 text-sm bg-surface-hover hover:bg-surface-hover rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(task.id)}
                      className="px-3 py-1 text-sm bg-red-900/50 hover:bg-red-900 text-red-200 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg border border-border p-6 max-w-md">
            <h3 className="text-lg font-bold mb-2 text-foreground">Delete Task?</h3>
            <p className="text-foreground-muted mb-4">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-foreground-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-600 dark:bg-red-900 text-white dark:text-red-200 rounded hover:bg-red-700 dark:hover:bg-red-900/80"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditTask(null)
        }}
        onSave={handleSave}
        editTask={editTask}
        projects={projects}
      />
    </div>
  )
}