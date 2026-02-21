'use client'

import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface DocumentFile {
  path: string
  name: string
  extension: string
  size: number
  created_at: string
  modified_at: string
}

const EXTENSIONS = ['.md', '.txt', '.pdf', '.jpg', '.png', '.json']
const TEXT_EXTENSIONS = new Set(['.md', '.txt', '.json'])
const ROOT_PATH = '/Users/daisydukes/openclaw-projects'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>(EXTENSIONS)
  const [sortNewest, setSortNewest] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<DocumentFile | null>(null)
  const [contentMap, setContentMap] = useState<Record<string, string>>({})
  const [loadingContent, setLoadingContent] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    try {
      const res = await fetch('/api/documents')
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

  async function ensureContent(path: string) {
    if (contentMap[path]) return
    try {
      const res = await fetch(`/api/documents/content?path=${encodeURIComponent(path)}`)
      if (!res.ok) return
      const data = await res.json()
      setContentMap(prev => ({ ...prev, [path]: data.content || '' }))
    } catch (error) {
      console.error('Failed to load content:', error)
    }
  }

  useEffect(() => {
    const textDocs = documents.filter(doc => TEXT_EXTENSIONS.has(doc.extension))
    textDocs.forEach(doc => ensureContent(doc.path))
  }, [documents])

  useEffect(() => {
    if (!selectedDoc) return
    if (TEXT_EXTENSIONS.has(selectedDoc.extension)) {
      setLoadingContent(true)
      ensureContent(selectedDoc.path).finally(() => setLoadingContent(false))
    }
  }, [selectedDoc])

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = documents.filter(doc => {
      if (!selectedExtensions.includes(doc.extension)) return false
      if (!query) return true
      const inName = doc.name.toLowerCase().includes(query)
      const inPath = doc.path.toLowerCase().includes(query)
      const content = contentMap[doc.path] || ''
      const inContent = content.toLowerCase().includes(query)
      return inName || inPath || inContent
    })

    return filtered.sort((a, b) => {
      const aTime = new Date(a.modified_at).getTime()
      const bTime = new Date(b.modified_at).getTime()
      return sortNewest ? bTime - aTime : aTime - bTime
    })
  }, [documents, search, selectedExtensions, sortNewest, contentMap])

  const reviewDocuments = useMemo(() => {
    const now = Date.now()
    return filteredDocuments.filter(doc => {
      const modified = new Date(doc.modified_at).getTime()
      const recent = now - modified < 24 * 60 * 60 * 1000
      const hasReview = (contentMap[doc.path] || '').includes('#review')
      return recent || hasReview
    })
  }, [filteredDocuments, contentMap])

  const mainDocuments = filteredDocuments.filter(doc => !reviewDocuments.includes(doc))

  const selectedContent = selectedDoc ? contentMap[selectedDoc.path] : ''

  function toggleExtension(ext: string) {
    setSelectedExtensions(prev =>
      prev.includes(ext) ? prev.filter(e => e !== ext) : [...prev, ext]
    )
  }

  async function copyContent() {
    if (!selectedDoc || !TEXT_EXTENSIONS.has(selectedDoc.extension)) return
    await navigator.clipboard.writeText(selectedContent || '')
  }

  function formatSize(size: number) {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) return <div className="p-8 text-foreground-muted">Loading documents...</div>

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <style jsx global>{`
        .hljs {
          background: #0f172a;
          color: #e2e8f0;
        }
        .hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-section, .hljs-link {
          color: #60a5fa;
        }
        .hljs-string, .hljs-title, .hljs-name, .hljs-type, .hljs-attribute, .hljs-symbol {
          color: #34d399;
        }
        .hljs-comment, .hljs-quote {
          color: #94a3b8;
        }
      `}</style>

      {/* Sidebar */}
      <aside className="w-full lg:w-96 border-r border-border bg-surface p-6 space-y-6 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold mb-1">📚 Documents 2.0</h1>
          <p className="text-sm text-foreground-muted">{documents.length} files indexed</p>
        </div>

        <div className="space-y-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or content..."
            className="w-full rounded border border-border bg-surface-hover px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            {EXTENSIONS.map(ext => (
              <button
                key={ext}
                onClick={() => toggleExtension(ext)}
                className={`px-3 py-1 rounded text-xs border ${
                  selectedExtensions.includes(ext)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-surface border-border text-foreground-muted hover:bg-surface-hover'
                }`}
              >
                {ext}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-foreground-muted">Sort</span>
            <button
              onClick={() => setSortNewest(true)}
              className={`px-3 py-1 rounded border ${sortNewest ? 'bg-surface-hover border-border' : 'border-transparent text-foreground-muted'}`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortNewest(false)}
              className={`px-3 py-1 rounded border ${!sortNewest ? 'bg-surface-hover border-border' : 'border-transparent text-foreground-muted'}`}
            >
              Oldest
            </button>
          </div>
        </div>

        {/* For Review */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">For Review</h2>
            <span className="text-xs text-foreground-muted">{reviewDocuments.length}</span>
          </div>
          {reviewDocuments.length === 0 ? (
            <p className="text-xs text-foreground-muted">No files flagged yet.</p>
          ) : (
            <div className="space-y-2">
              {reviewDocuments.map(doc => (
                <button
                  key={doc.path}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full text-left p-3 rounded border ${
                    selectedDoc?.path === doc.path
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'bg-surface-hover border-border hover:border-foreground-muted'
                  }`}
                >
                  <div className="text-sm font-medium truncate">{doc.name}</div>
                  <div className="text-xs text-foreground-muted">{doc.path}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* All Documents */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">All Documents</h2>
            <span className="text-xs text-foreground-muted">{mainDocuments.length}</span>
          </div>
          {mainDocuments.length === 0 ? (
            <p className="text-xs text-foreground-muted">No files match current filters.</p>
          ) : (
            <div className="space-y-2">
              {mainDocuments.map(doc => (
                <button
                  key={doc.path}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full text-left p-3 rounded border ${
                    selectedDoc?.path === doc.path
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'bg-surface-hover border-border hover:border-foreground-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{doc.name}</span>
                    <span className="text-xs text-foreground-muted">{doc.extension}</span>
                  </div>
                  <div className="text-xs text-foreground-muted truncate">{doc.path}</div>
                  <div className="text-[11px] text-foreground-muted mt-1">
                    {new Date(doc.modified_at).toLocaleString()} · {formatSize(doc.size)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Viewer */}
      <section className="flex-1 p-6 overflow-y-auto">
        {!selectedDoc ? (
          <div className="h-full flex items-center justify-center text-foreground-muted">
            Select a document to preview
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{selectedDoc.name}</h2>
                <p className="text-sm text-foreground-muted">{selectedDoc.path}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyContent}
                  disabled={!TEXT_EXTENSIONS.has(selectedDoc.extension)}
                  className="px-4 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
                >
                  Copy Content
                </button>
                <a
                  href={`vscode://file/${ROOT_PATH}/${selectedDoc.path}`}
                  className="px-4 py-2 rounded border border-border text-sm hover:bg-surface-hover"
                >
                  Open in Editor
                </a>
              </div>
            </div>

            {TEXT_EXTENSIONS.has(selectedDoc.extension) && (
              <div className="bg-surface border border-border rounded-lg p-6">
                {loadingContent ? (
                  <p className="text-foreground-muted">Loading content...</p>
                ) : selectedDoc.extension === '.md' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    className="prose prose-invert max-w-none"
                  >
                    {selectedContent || 'No content.'}
                  </ReactMarkdown>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    className="prose prose-invert max-w-none"
                  >
                    {`\`\`\`${selectedDoc.extension.replace('.', '') || 'text'}\n${selectedContent || ''}\n\`\`\``}
                  </ReactMarkdown>
                )}
              </div>
            )}

            {selectedDoc.extension === '.pdf' && (
              <iframe
                src={`/api/documents/content?path=${encodeURIComponent(selectedDoc.path)}`}
                className="w-full min-h-[70vh] border border-border rounded-lg bg-black"
              />
            )}

            {(selectedDoc.extension === '.jpg' || selectedDoc.extension === '.png') && (
              <div className="bg-surface border border-border rounded-lg p-4 flex items-center justify-center">
                <img
                  src={`/api/documents/content?path=${encodeURIComponent(selectedDoc.path)}`}
                  alt={selectedDoc.name}
                  className="max-h-[70vh] object-contain"
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
