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
        <p className="text-zinc-500">Loading documents...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Documents Library</h1>
          <p className="text-zinc-500">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'grid' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-zinc-200"
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
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 w-64"
        />
        
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as DocumentType | 'All')}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
        >
          <option value="All">All Types</option>
          {DOCUMENT_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={projectFilter}
          onChange={e => setProjectFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
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
            className="text-zinc-400 hover:text-zinc-200 text-sm"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8">
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-start p-6 border-b border-zinc-800">
              <div>
                <span className="text-xs px-2 py-1 bg-zinc-800 rounded mr-2">{selectedDoc.type}</span>
                <h2 className="text-xl font-bold mt-2">{selectedDoc.title}</h2>
                {getProjectName(selectedDoc.related_project_id) && (
                  <p className="text-sm text-zinc-400 mt-1">📁 {getProjectName(selectedDoc.related_project_id)}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedDoc)}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-sm"
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
                  className="text-zinc-500 hover:text-zinc-300 text-xl ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {selectedDoc.content ? (
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedDoc.content) }}
                />
              ) : (
                <p className="text-zinc-500 italic">No content</p>
              )}
              {selectedDoc.summary && (
                <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Summary</h4>
                  <p className="text-sm">{selectedDoc.summary}</p>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
                <span>Created: {new Date(selectedDoc.created_at).toLocaleDateString()}</span>
                {selectedDoc.word_count && <span>• {selectedDoc.word_count} words</span>}
                {selectedDoc.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-zinc-800 rounded">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents Grid/List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-12 text-center">
          <p className="text-4xl mb-4">📄</p>
          <p className="text-lg font-medium mb-2">
            {documents.length === 0 ? 'No documents yet' : 'No matching documents'}
          </p>
          <p className="text-sm text-zinc-500">
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
              className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 hover:border-zinc-700 transition-colors group cursor-pointer"
              onClick={() => setSelectedDoc(doc)}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded">{doc.type}</span>
                <span className="text-xs text-zinc-500">{doc.word_count} words</span>
              </div>
              <h3 className="font-medium mb-2 line-clamp-2">{doc.title}</h3>
              {doc.summary && (
                <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{doc.summary}</p>
              )}
              <div className="flex flex-wrap gap-1 text-xs">
                {getProjectName(doc.related_project_id) && (
                  <span className="px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded">📁</span>
                )}
                {doc.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">#{tag}</span>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); openEditModal(doc); }}
                  className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(doc.id); }}
                  className="text-xs px-2 py-1 bg-red-900/50 hover:bg-red-900 text-red-200 rounded"
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
              className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 hover:border-zinc-700 transition-colors group cursor-pointer"
              onClick={() => setSelectedDoc(doc)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded">{doc.type}</span>
                    <h3 className="font-medium">{doc.title}</h3>
                  </div>
                  {doc.summary && (
                    <p className="text-zinc-400 text-sm mb-2">{doc.summary}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                    {getProjectName(doc.related_project_id) && (
                      <span className="text-blue-400">📁 {getProjectName(doc.related_project_id)}</span>
                    )}
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    <span>{doc.word_count} words</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(doc); }}
                    className="px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteId(doc.id); }}
                    className="px-3 py-1 text-sm bg-red-900/50 hover:bg-red-900 text-red-200 rounded"
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
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 max-w-md">
            <h3 className="text-lg font-bold mb-2">Delete Document?</h3>
            <p className="text-zinc-400 mb-4">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
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