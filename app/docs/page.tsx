'use client'

import { useEffect, useState } from 'react'
import { Document, DocumentType, Project } from '@/lib/types'
import DocumentModal from '@/components/docs/DocumentModal'

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

export default function DocsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editDocument, setEditDocument] = useState<Document | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'All'>('All')
  const [projectFilter, setProjectFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

  async function fetchDocuments() {
    try {
      const url = searchQuery 
        ? `/api/documents?q=${encodeURIComponent(searchQuery)}`
        : '/api/documents'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
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
    fetchDocuments()
    fetchProjects()
  }, [searchQuery])

  async function handleSave(documentData: Partial<Document>) {
    if (editDocument) {
      await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editDocument.id, ...documentData }),
      })
    } else {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentData),
      })
    }
    fetchDocuments()
    setEditDocument(null)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/documents?id=${id}`, { method: 'DELETE' })
    setDeleteId(null)
    setSelectedDoc(null)
    fetchDocuments()
  }

  function openCreateModal() {
    setEditDocument(null)
    setModalOpen(true)
  }

  function openEditModal(document: Document) {
    setEditDocument(document)
    setModalOpen(true)
  }

  const filteredDocuments = documents.filter(d => {
    const matchesType = typeFilter === 'All' || d.type === typeFilter
    const matchesProject = projectFilter === 'All' || d.related_project_id === projectFilter
    return matchesType && matchesProject
  })

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null
    const project = projects.find(p => p.id === projectId)
    return project?.name
  }

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering - convert headers, bold, lists
    let html = content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n/gim, '<br />')
    return html
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Documents Library</h1>
        <p className="text-foreground-muted">Loading documents...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Documents Library</h1>
          <p className="text-foreground-muted">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-background-subtle rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'grid' ? 'bg-surface text-foreground dark:text-white' : 'text-foreground-muted'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'list' ? 'bg-surface text-foreground dark:text-white' : 'text-foreground-muted'
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            + New Document
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-surface border border-border rounded px-3 py-2 w-64 text-foreground"
        />
        
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as DocumentType | 'All')}
          className="bg-surface border border-border rounded px-3 py-2 text-foreground"
        >
          <option value="All">All Types</option>
          {DOCUMENT_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
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

        {(typeFilter !== 'All' || projectFilter !== 'All' || searchQuery) && (
          <button
            onClick={() => {
              setTypeFilter('All')
              setProjectFilter('All')
              setSearchQuery('')
            }}
            className="text-foreground-subtle hover:text-foreground text-sm"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8">
          <div className="bg-surface rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-start p-6 border-b border-border">
              <div>
                <span className="text-xs px-2 py-1 bg-secondary rounded mr-2">{selectedDoc.type}</span>
                <h2 className="text-xl font-bold mt-2">{selectedDoc.title}</h2>
                {getProjectName(selectedDoc.related_project_id) && (
                  <p className="text-sm text-foreground-muted mt-1">📁 {getProjectName(selectedDoc.related_project_id)}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedDoc)}
                  className="px-3 py-1 bg-surface-hover hover:bg-surface-hover rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteId(selectedDoc.id)}
                  className="px-3 py-1 bg-red-900/50 hover:bg-red-900 text-red-200 rounded text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-foreground-subtle hover:text-foreground-muted text-xl ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {selectedDoc.content ? (
                <div 
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedDoc.content) }}
                />
              ) : (
                <p className="text-foreground-subtle italic">No content</p>
              )}
              {selectedDoc.summary && (
                <div className="mt-6 p-4 bg-secondary/50 rounded-lg border border-border">
                  <h4 className="text-sm font-medium text-foreground-muted mb-2">Summary</h4>
                  <p className="text-sm text-foreground-muted">{selectedDoc.summary}</p>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-foreground-muted">
                <span>Created: {selectedDoc.created_at ? new Date(selectedDoc.created_at).toLocaleDateString() : 'Unknown'}</span>
                {selectedDoc.word_count && <span>• {selectedDoc.word_count} words</span>}
                {selectedDoc.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-background-subtle rounded text-foreground-muted">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents Grid/List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border p-12 text-center">
          <p className="text-4xl mb-4">📄</p>
          <p className="text-lg font-medium mb-2">
            {documents.length === 0 ? 'No documents yet' : 'No matching documents'}
          </p>
          <p className="text-sm text-foreground-muted">
            {documents.length === 0 
              ? 'Create your first document to get started'
              : 'Try adjusting your filters'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div 
              key={doc.id}
              className="bg-surface rounded-lg border border-border p-4 hover:border-foreground-subtle transition-colors group cursor-pointer"
              onClick={() => setSelectedDoc(doc)}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs px-2 py-0.5 bg-secondary rounded text-foreground-muted">{doc.type}</span>
                <span className="text-xs text-foreground-muted">{doc.word_count} words</span>
              </div>
              <h3 className="font-medium mb-2 line-clamp-2">{doc.title}</h3>
              {doc.summary && (
                <p className="text-sm text-foreground-muted mb-3 line-clamp-2">{doc.summary}</p>
              )}
              <div className="flex flex-wrap gap-1 text-xs">
                {getProjectName(doc.related_project_id) && (
                  <span className="px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded">📁</span>
                )}
                {doc.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-secondary rounded text-foreground-muted">#{tag}</span>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); openEditModal(doc); }}
                  className="text-xs px-2 py-1 bg-background-subtle hover:bg-surface-hover rounded text-foreground"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(doc.id); }}
                  className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-200 rounded"
                >
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <div 
              key={doc.id}
              className="bg-surface rounded-lg border border-border p-4 hover:border-foreground-subtle transition-colors group cursor-pointer"
              onClick={() => setSelectedDoc(doc)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs px-2 py-0.5 bg-secondary rounded text-foreground-muted">{doc.type}</span>
                    <h3 className="font-medium text-foreground">{doc.title}</h3>
                  </div>
                  {doc.summary && (
                    <p className="text-foreground-muted text-sm mb-2">{doc.summary}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-foreground-subtle">
                    {getProjectName(doc.related_project_id) && (
                      <span className="text-blue-600 dark:text-blue-400">📁 {getProjectName(doc.related_project_id)}</span>
                    )}
                    <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Unknown'}</span>
                    <span>{doc.word_count} words</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(doc); }}
                    className="px-3 py-1 text-sm bg-background-subtle hover:bg-surface-hover rounded text-foreground"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteId(doc.id); }}
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
          <div className="bg-background-subtle rounded-lg border border-border p-6 max-w-md">
            <h3 className="text-lg font-bold mb-2">Delete Document?</h3>
            <p className="text-foreground-subtle mb-4">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-foreground-subtle hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-900 text-red-200 rounded hover:bg-red-900/80"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <DocumentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditDocument(null)
        }}
        onSave={handleSave}
        editDocument={editDocument}
        projects={projects}
      />
    </div>
  )
}