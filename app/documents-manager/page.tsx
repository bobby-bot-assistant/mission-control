'use client'

import { useEffect, useState, useRef } from 'react'
import { OutreachDocument, Person } from '@/lib/types'

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: '📧 Email Template', value: 'email-template' },
  { label: '📋 Executive Summary', value: 'executive-summary' },
  { label: '⚖️ Legal Document', value: 'legal-document' },
  { label: '📎 Outreach Asset', value: 'outreach-asset' },
  { label: '📁 Other', value: 'other' },
]

export default function DocumentsManagerPage() {
  const [documents, setDocuments] = useState<OutreachDocument[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [viewDoc, setViewDoc] = useState<OutreachDocument | null>(null)
  const [editContent, setEditContent] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [linkingDoc, setLinkingDoc] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadCategory, setUploadCategory] = useState('other')
  const [uploadTags, setUploadTags] = useState('')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchDocuments()
    fetchPeople()
  }, [])

  async function fetchDocuments() {
    try {
      const res = await fetch('/api/outreach-documents')
      if (res.ok) setDocuments(await res.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function fetchPeople() {
    try {
      const res = await fetch('/api/people')
      if (res.ok) setPeople(await res.json())
    } catch (e) { console.error(e) }
  }

  async function uploadFile(file: File) {
    setSelectedFile(file)
    setUploadTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
    setShowUploadForm(true)
  }

  async function submitUpload() {
    if (!selectedFile) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('title', uploadTitle)
    formData.append('category', uploadCategory)
    formData.append('tags', uploadTags)

    try {
      await fetch('/api/outreach-documents/upload', { method: 'POST', body: formData })
      fetchDocuments()
      setShowUploadForm(false)
      setSelectedFile(null)
      setUploadTitle('')
      setUploadCategory('other')
      setUploadTags('')
    } catch (e) { console.error(e) }
    finally { setUploading(false) }
  }

  async function deleteDoc(id: string) {
    if (!confirm('Delete this document?')) return
    await fetch(`/api/outreach-documents?id=${id}`, { method: 'DELETE' })
    fetchDocuments()
    if (viewDoc?.id === id) setViewDoc(null)
  }

  async function saveContent() {
    if (!viewDoc) return
    await fetch('/api/outreach-documents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: viewDoc.id, content: editContent }),
    })
    fetchDocuments()
    setViewDoc({ ...viewDoc, content: editContent })
  }

  async function linkContact(docId: string, personId: string) {
    const doc = documents.find(d => d.id === docId)
    if (!doc) return
    await fetch('/api/outreach-documents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: docId, linked_contacts: [...doc.linked_contacts, personId] }),
    })
    fetchDocuments()
    setLinkingDoc(null)
  }

  async function unlinkContact(docId: string, personId: string) {
    const doc = documents.find(d => d.id === docId)
    if (!doc) return
    await fetch('/api/outreach-documents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: docId, linked_contacts: doc.linked_contacts.filter(id => id !== personId) }),
    })
    fetchDocuments()
  }

  async function seedOutreach() {
    setSeeding(true)
    try {
      await fetch('/api/seed-outreach', { method: 'POST' })
      fetchDocuments()
    } catch (e) { console.error(e) }
    finally { setSeeding(false) }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  const filtered = categoryFilter
    ? documents.filter(d => d.category === categoryFilter)
    : documents

  const getPersonName = (id: string) => people.find(p => p.id === id)?.name || id

  if (loading) return <div className="p-8 text-foreground-muted">Loading documents...</div>

  return (
    <div className="p-8 overflow-y-auto h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">📎 Document Manager</h1>
          <p className="text-foreground-muted text-sm">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          {documents.length === 0 && (
            <button
              onClick={seedOutreach}
              disabled={seeding}
              className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 text-sm disabled:opacity-50"
            >
              {seeding ? 'Seeding...' : '🌱 Import Outreach Assets'}
            </button>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            + Upload Document
          </button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={e => { if (e.target.files?.[0]) uploadFile(e.target.files[0]) }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setCategoryFilter(c.value)}
            className={`px-3 py-1.5 rounded text-sm border ${
              categoryFilter === c.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-surface border-border text-foreground-muted hover:bg-surface-hover'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-border text-foreground-muted'
        }`}
      >
        <p className="text-lg mb-1">📁 Drop files here to upload</p>
        <p className="text-sm">or click the Upload button above</p>
      </div>

      {/* Document List */}
      {filtered.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border p-12 text-center">
          <p className="text-4xl mb-4">📎</p>
          <p className="text-lg font-medium mb-2">No documents yet</p>
          <p className="text-sm text-foreground-muted">Upload files or import outreach assets to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-surface rounded-lg border border-border p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium">{doc.title}</h3>
                    <span className="text-xs px-2 py-0.5 bg-surface-hover rounded">{doc.category}</span>
                  </div>
                  <p className="text-xs text-foreground-muted mb-2">{doc.filename} · {doc.mime_type}</p>

                  {/* Linked contacts */}
                  {doc.linked_contacts.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {doc.linked_contacts.map(cid => (
                        <span key={cid} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded">
                          {getPersonName(cid)}
                          <button onClick={() => unlinkContact(doc.id, cid)} className="hover:text-red-300">×</button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-surface-hover rounded text-foreground-muted">#{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setLinkingDoc(doc.id)}
                    className="px-2 py-1 text-xs bg-surface-hover border border-border rounded hover:bg-surface"
                  >
                    👤 Link
                  </button>
                  {doc.content && (
                    <button
                      onClick={() => { setViewDoc(doc); setEditContent(doc.content || '') }}
                      className="px-2 py-1 text-xs bg-surface-hover border border-border rounded hover:bg-surface"
                    >
                      View/Edit
                    </button>
                  )}
                  <a
                    href={`/api/outreach-documents/${doc.id}/download`}
                    className="px-2 py-1 text-xs bg-surface-hover border border-border rounded hover:bg-surface"
                  >
                    ⬇ Download
                  </a>
                  <button
                    onClick={() => deleteDoc(doc.id)}
                    className="px-2 py-1 text-xs bg-red-900/50 text-red-200 rounded hover:bg-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View/Edit Document Modal */}
      {viewDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg border border-border p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{viewDoc.title}</h3>
              <button onClick={() => setViewDoc(null)} className="text-foreground-muted hover:text-foreground">✕</button>
            </div>
            <textarea
              rows={24}
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded px-3 py-2 text-foreground font-mono text-sm mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setViewDoc(null)} className="px-4 py-2 text-foreground-muted hover:text-foreground text-sm">
                Cancel
              </button>
              <button onClick={saveContent} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Contact Modal */}
      {linkingDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg border border-border p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Link to Contact</h3>
              <button onClick={() => setLinkingDoc(null)} className="text-foreground-muted hover:text-foreground">✕</button>
            </div>
            {(() => {
              const doc = documents.find(d => d.id === linkingDoc)
              const unlinked = people.filter(p => !doc?.linked_contacts.includes(p.id))
              return unlinked.length === 0 ? (
                <p className="text-foreground-muted text-sm">All contacts are already linked.</p>
              ) : (
                <div className="space-y-2">
                  {unlinked.map(p => (
                    <button
                      key={p.id}
                      onClick={() => linkContact(linkingDoc, p.id)}
                      className="w-full text-left p-3 bg-surface-hover rounded border border-border hover:border-foreground-muted"
                    >
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-foreground-muted">{p.organization || p.relationship}</p>
                    </button>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg border border-border p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Upload Document</h3>
              <button onClick={() => { setShowUploadForm(false); setSelectedFile(null) }} className="text-foreground-muted hover:text-foreground">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">File</label>
                <p className="text-sm text-foreground-muted bg-surface-hover px-3 py-2 rounded">{selectedFile?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="w-full bg-surface-hover border border-border rounded px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value)}
                  className="w-full bg-surface-hover border border-border rounded px-3 py-2 text-foreground"
                >
                  <option value="email-template">Email Template</option>
                  <option value="executive-summary">Executive Summary</option>
                  <option value="legal-document">Legal Document</option>
                  <option value="outreach-asset">Outreach Asset</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={e => setUploadTags(e.target.value)}
                  className="w-full bg-surface-hover border border-border rounded px-3 py-2 text-foreground"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowUploadForm(false); setSelectedFile(null) }} className="px-4 py-2 text-foreground-muted hover:text-foreground text-sm">
                  Cancel
                </button>
                <button onClick={submitUpload} disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
