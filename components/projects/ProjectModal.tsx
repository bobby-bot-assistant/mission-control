'use client'

import { useState, useEffect } from 'react'
import { Project, ProjectStatus, Priority, Category } from '@/lib/types'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: Partial<Project>) => Promise<void>
  editProject?: Project | null
}

const STATUS_OPTIONS: ProjectStatus[] = [
  '💡 Idea / Brainstorming',
  '🔬 Research & Discovery',
  '📐 Architecture & Planning',
  '🏗 In Development',
  '🧪 Testing / Review',
  '✅ Completed',
  '⏸️ Paused',
  '🗄 Archived',
]

const PRIORITY_OPTIONS: Priority[] = [
  '🔴 Critical',
  '🟠 High',
  '🟡 Medium',
  '🟢 Low',
]

const CATEGORY_OPTIONS: Category[] = [
  'Personal',
  'Business',
  'Learning',
  'Client Work',
  'Side Project',
]

export default function ProjectModal({ isOpen, onClose, onSave, editProject }: ProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    codename: '',
    vision: '',
    status: '💡 Idea / Brainstorming' as ProjectStatus,
    priority: '🟡 Medium' as Priority,
    category: 'Business' as Category,
    tags: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editProject) {
      setFormData({
        name: editProject.name,
        codename: editProject.codename || '',
        vision: editProject.vision,
        status: editProject.status,
        priority: editProject.priority,
        category: editProject.category,
        tags: editProject.tags.join(', '),
      })
    } else {
      setFormData({
        name: '',
        codename: '',
        vision: '',
        status: '💡 Idea / Brainstorming',
        priority: '🟡 Medium',
        category: 'Business',
        tags: '',
      })
    }
  }, [editProject, isOpen])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        started: new Date().toISOString().split('T')[0],
        last_active: new Date().toISOString(),
      })
      onClose()
    } catch (error) {
      console.error('Failed to save project:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {editProject ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              placeholder="Project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Codename (optional)</label>
            <input
              type="text"
              value={formData.codename}
              onChange={e => setFormData({ ...formData, codename: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              placeholder="Short reference name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Vision *</label>
            <textarea
              required
              rows={3}
              value={formData.vision}
              onChange={e => setFormData({ ...formData, vision: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              placeholder="1-2 sentence description of success"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              >
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
                placeholder="tag1, tag2, tag3"
              />
            </div>
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
              {saving ? 'Saving...' : editProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
