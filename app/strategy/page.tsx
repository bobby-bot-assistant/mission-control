'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface ManifestoData {
  content: string
  source: string
  path: string
}

interface ArchivedDoc {
  slug: string
  title: string
  icon: string
  badge?: string
  exists: boolean
  lastModified: string
  size: number
  content: string
  preview: string
}

interface StrategyData {
  manifesto: ManifestoData | null
  archived: ArchivedDoc[]
}

export default function StrategyPage() {
  const [data, setData] = useState<StrategyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  const [manifestoExpanded, setManifestoExpanded] = useState(false)

  useEffect(() => {
    fetch('/api/strategy')
      .then(r => r.json())
      .then(responseData => {
        if (!responseData.error) {
          setData(responseData)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Strategy</h1>
        <p className="text-gray-700 dark:text-gray-300">Loading strategy data...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Strategy</h1>
        <p className="text-gray-700 dark:text-gray-300">No strategy data found</p>
      </div>
    )
  }

  const { manifesto, archived } = data

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">🗺️ Strategy</h1>
        <p className="text-gray-700 dark:text-gray-300">
          Strategic vision and archive for Mindful Media
        </p>
      </div>

      {/* Supporting Docs Links */}
      <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">📚 Quick Links</h3>
        <div className="flex flex-wrap gap-3">
          <a 
            href="/pipeline" 
            className="px-3 py-2 bg-blue-600/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
          >
            Pipeline
          </a>
          <a 
            href="/research" 
            className="px-3 py-2 bg-purple-600/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
          >
            Research & Intel
          </a>
        </div>
      </div>

      {/* Pulse Strategy Manifesto - Featured Section */}
      {manifesto && (
        <div className="mb-12">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
            <button
              onClick={() => setManifestoExpanded(!manifestoExpanded)}
              className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">📋</span>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pulse Strategy Manifesto</h2>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    The living strategic vision for Mindful Media — why we&apos;re building this and how it fits into everything.
                  </p>
                  {!manifestoExpanded && (
                    <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">Click to expand ▼</p>
                  )}
                  <div className="mt-2 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>📄 Source: {manifesto.source}</span>
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${manifestoExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded Manifesto Content */}
            {manifestoExpanded && (
              <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                <div className="pt-6 prose prose-gray dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300">
                  <ReactMarkdown>{manifesto.content}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Strategy Archive Section */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">📚 Strategy Archive</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Legacy strategy documents from previous iterations.
        </p>

        <div className="space-y-4">
          {archived.filter(doc => doc.exists).map((doc) => {
            const isExpanded = expandedDoc === doc.slug
            
            return (
              <div
                key={doc.slug}
                className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800"
              >
                <button
                  onClick={() => setExpandedDoc(isExpanded ? null : doc.slug)}
                  className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">{doc.icon}</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{doc.title}</h3>
                        {doc.badge && (
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            doc.badge === 'COMPLETE' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {doc.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{doc.preview}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-500">
                        <span>📝 {Math.round(doc.size / 1024)}KB</span>
                        {doc.lastModified && (
                          <span>📅 {new Date(doc.lastModified).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && doc.content && (
                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="pt-4 prose prose-gray dark:prose-invert max-w-none prose-sm prose-p:text-gray-700 dark:prose-p:text-gray-300">
                      <ReactMarkdown>{doc.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
