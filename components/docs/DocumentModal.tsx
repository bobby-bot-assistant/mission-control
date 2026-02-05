'use client'

import { useState, useEffect } from 'react'
import { Document, DocumentType, Project } from '@/lib/types'

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (document: Partial<Document>) => Promise<void>
  editDocument?: Document | null
  projects: Project[]
}

const DOCUMENT_TYPES: DocumentType[] = [
  '📝 Note / Scratchpad',
  '📓 Journal Entry',
  '📄 Document / Report',
  '📜 Script',
  '💻 Code / Technical',
  '🔬 Research Summary',
  '📧 Template',
  '📊 Analysis / Data',
  '🎯 Strategy / Plan',
  '💡 Ideas / Brainstorm',
]

export default function DocumentModal({ isOpen, onClose, onSave, editDocument, projects }: DocumentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: '📝 Note / Scratchpad' as DocumentType,
    content: '',
    summary: '',
    related_project_id: '',
    file_format: '',
    source_context: '',
    tags: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editDocument) {
      setFormData({
        title: editDocument.title,
        type: editDocument.type,
        content: editDocument.content || '',
        summary: editDocument.summary || '',
        related_project_id: editDocument.related_project_id || '',
        file_format: editDocument.file_format || '',
        source_context: editDocument.source_context || '',
        tags: editDocument.tags.join(', '),
      })
    } else {
      setFormData({
        title: '',
        type: '📝 Note / Scratchpad',
        content: '',
        summary: '',
        related_project_id: '',
        file_format: '',
        source_context: '',
        tags: '',
      })
    }
  }, [editDocument, isOpen])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const wordCount = formData.content.split(/\s+/).filter(w => w.length > 0).length

      await onSave({
        title: formData.title,
        type: formData.type,
        content: formData.content || undefined,
        summary: formData.summary || undefined,
        related_project_id: formData.related_project_id || undefined,
        file_format: formData.file_format || undefined,
        source_context: formData.source_context || undefined,
        word_count: wordCount,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      })
      onClose()
    } catch (error) {
      console.error('Failed to save document:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 w-full max-w-2xl p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {editDocument ? 'Edit Document' : 'Create New Document'}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
                placeholder="Document title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Document Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as DocumentType })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              >
                {DOCUMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-1">Content (Markdown supported)</label>
            <textarea
              rows={10}
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 font-mono text-sm"
              placeholder="# Heading

Write your document content here...

- List item 1
- List item 2

**Bold text** and *italic text*"
            />
            <p className="text-xs text-zinc-500 mt-1">
              {formData.content.split(/\s+/).filter(w => w.length > 0).length} words
            </p>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium mb-1">Summary</label>
            <input
              type="text"
              value={formData.summary}
              onChange={e => setFormData({ ...formData, summary: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              placeholder="Brief summary (shown in document cards)"
            />
          </div>

          {/* Project & Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Link</label>
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

            <div>
              <label className="block text-sm font-medium mb-1">Source Context</label>
              <input
                type="text"
                value={formData.source_context}
                onChange={e => setFormData({ ...formData, source_context: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
                placeholder="Where did this come from?"
              />
            </div>
          </div>

          {/* File Format & Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">File Format</label>
              <input
                type="text"
                value={formData.file_format}
                onChange={e => setFormData({ ...formData, file_format: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
                placeholder="md, txt, pdf, etc."
              />
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
              {saving ? 'Saving...' : editDocument ? 'Save Changes' : 'Create Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}