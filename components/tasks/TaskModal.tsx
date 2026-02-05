'use client'

import { useState, useEffect } from 'react'
import { Task, TaskStatus, Priority, Project, Subtask } from '@/lib/types'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Partial<Task>) => Promise<void>
  editTask?: Task | null
  projects: Project[]
}

const STATUS_OPTIONS: TaskStatus[] = [
  '📥 Backlog (captured but not started)',
  '🎯 Up Next (queued for soon)',
  '🔄 In Progress (actively working)',
  '👀 Review / Waiting (blocked or needs input)',
  '✅ Completed',
  '❌ Cancelled',
]

const PRIORITY_OPTIONS: Priority[] = [
  '🔴 Critical',
  '🟠 High',
  '🟡 Medium',
  '🟢 Low',
]

export default function TaskModal({ isOpen, onClose, onSave, editTask, projects }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '📥 Backlog (captured but not started)' as TaskStatus,
    priority: '🟡 Medium' as Priority,
    due_date: '',
    completed_date: '',
    related_project_id: '',
    notes: '',
    subtasks: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title,
        description: editTask.description || '',
        status: editTask.status,
        priority: editTask.priority,
        due_date: editTask.due_date || '',
        completed_date: editTask.completed_date || '',
        related_project_id: editTask.related_project_id || '',
        notes: editTask.notes.join('\n'),
        subtasks: editTask.subtasks.map(s => `${s.completed ? '[x]' : '[ ]'} ${s.title}`).join('\n'),
      })
    } else {
      setFormData({
        title: '',
        description: '',
        status: '📥 Backlog (captured but not started)',
        priority: '🟡 Medium',
        due_date: '',
        completed_date: '',
        related_project_id: '',
        notes: '',
        subtasks: '',
      })
    }
  }, [editTask, isOpen])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      // Parse subtasks from text
      const subtasks: Subtask[] = formData.subtasks
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map((line, index) => {
          const completed = line.startsWith('[x]') || line.startsWith('[X]')
          const title = line.replace(/^\[[xX ]?\]\s*/, '')
          return {
            id: `subtask_${index}`,
            title,
            completed,
          }
        })

      // Parse notes from text
      const notes = formData.notes
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

      const taskData = {
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || undefined,
        completed_date: formData.completed_date || undefined,
        related_project_id: formData.related_project_id || undefined,
        notes,
        subtasks,
      }

      await onSave(taskData)
      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 w-full max-w-2xl p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {editTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              placeholder="What needs to be done?"
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              >
                {PRIORITY_OPTIONS.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates & Project */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Completed Date</label>
              <input
                type="date"
                value={formData.completed_date}
                onChange={e => setFormData({ ...formData, completed_date: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Project</label>
              <select
                value={formData.related_project_id}
                onChange={e => setFormData({ ...formData, related_project_id: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              >
                <option value="">No Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium mb-1">Subtasks</label>
            <textarea
              rows={4}
              value={formData.subtasks}
              onChange={e => setFormData({ ...formData, subtasks: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              placeholder="[ ] Uncompleted subtask&#10;[x] Completed subtask&#10;[ ] Another task"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Use [ ] for incomplete, [x] for complete
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              placeholder="Additional notes, context, or updates (one per line)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}