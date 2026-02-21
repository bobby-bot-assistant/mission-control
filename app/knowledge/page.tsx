'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Document {
  id: string
  title: string
  type: 'grant' | 'research' | 'brief' | 'draft' | 'template' | 'memory'
  category: string
  lastUpdated: string
  size?: string
  icon: string
}

interface ResearchConcept {
  id: string
  title: string
  field: string
  sdsScore: number
  status: 'active' | 'archived'
  lastUpdated: string
}

interface MemoryEntry {
  id: string
  date: string
  type: 'decision' | 'insight' | 'milestone' | 'learning'
  title: string
  summary: string
}

export default function KnowledgePage() {
  const router = useRouter()
  const [selectedView, setSelectedView] = useState<'documents' | 'research' | 'memory'>('documents')
  const [documents, setDocuments] = useState<Document[]>([])
  const [researchConcepts, setResearchConcepts] = useState<ResearchConcept[]>([])
  const [memoryEntries, setMemoryEntries] = useState<MemoryEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadKnowledgeBase()
  }, [])

  const loadKnowledgeBase = () => {
    // Documents
    setDocuments([
      {
        id: '1',
        title: 'NIH SBIR Phase I - Specific Aims Draft',
        type: 'grant',
        category: 'Funding Applications',
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        size: '2.4 MB',
        icon: '📄'
      },
      {
        id: '2',
        title: 'Cy Pres Positioning Dossier',
        type: 'brief',
        category: 'Strategic Documents',
        lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        size: '856 KB',
        icon: '⚖️'
      },
      {
        id: '3',
        title: 'Infant Mental Health Literature Review',
        type: 'research',
        category: 'Research Papers',
        lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        size: '1.2 MB',
        icon: '🔬'
      },
      {
        id: '4',
        title: 'Weekly Content Opportunity Brief Template',
        type: 'template',
        category: 'Templates',
        lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        size: '124 KB',
        icon: '📋'
      }
    ])

    // Research Concepts
    setResearchConcepts([
      {
        id: '1',
        title: 'AI-Powered Bedtime Companion (Simon 2.0)',
        field: 'NIH SBIR',
        sdsScore: 32.5,
        status: 'active',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Therapeutic Entertainment Network',
        field: 'NIMH Digital Mental Health',
        sdsScore: 31.0,
        status: 'active',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Parent-Child Co-Regulation Platform',
        field: 'NIH SBIR',
        sdsScore: 30.5,
        status: 'active',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Pediatric Mental Health Screening Suite',
        field: 'NIMH Digital Mental Health',
        sdsScore: 30.0,
        status: 'active',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '5',
        title: 'Just-in-Time Intervention System',
        field: 'NIMH Digital Mental Health',
        sdsScore: 29.5,
        status: 'active',
        lastUpdated: new Date().toISOString()
      }
    ])

    // Memory Entries
    setMemoryEntries([
      {
        id: '1',
        date: '2026-02-06',
        type: 'insight',
        title: 'Context Manager Built',
        summary: 'Created 3-tier context loading system to prevent token overflow. Core files < 2K tokens.'
      },
      {
        id: '2',
        date: '2026-02-06',
        type: 'decision',
        title: 'Pipeline Framework Established',
        summary: '4-stage pipeline: Opportunity → Idea → PRD → MVP. Competitive analysis required at Idea stage.'
      },
      {
        id: '3',
        date: '2026-02-05',
        type: 'milestone',
        title: 'SAM.gov Registration Identified',
        summary: 'Critical blocker for NIH SBIR eligibility. UEI processing takes 2-6 weeks.'
      },
      {
        id: '4',
        date: '2026-02-05',
        type: 'learning',
        title: 'Content Pillars Clarified',
        summary: 'Every piece of content must name at least one of the Three Crises.'
      }
    ])
  }

  // Filter based on search
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredResearch = researchConcepts.filter(concept =>
    concept.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    concept.field.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMemory = memoryEntries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.summary.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'grant': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
      case 'research': return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
      case 'brief': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
      case 'draft': return 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
      case 'template': return 'bg-secondary text-foreground-muted'
      case 'memory': return 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300'
    }
  }

  const getMemoryIcon = (type: MemoryEntry['type']) => {
    switch (type) {
      case 'decision': return '🎯'
      case 'insight': return '💡'
      case 'milestone': return '🏁'
      case 'learning': return '📚'
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📚 Knowledge Base</h1>
        <p className="text-foreground-muted">Documents, research, and institutional memory</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search across all knowledge..."
          className="w-full px-4 py-2 bg-surface border border-border rounded-lg"
        />
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedView('documents')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedView === 'documents'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:opacity-90'
          }`}
        >
          Documents ({documents.length})
        </button>
        <button
          onClick={() => setSelectedView('research')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedView === 'research'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:opacity-90'
          }`}
        >
          Research ({researchConcepts.length})
        </button>
        <button
          onClick={() => setSelectedView('memory')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedView === 'memory'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:opacity-90'
          }`}
        >
          Memory ({memoryEntries.length})
        </button>
      </div>

      {/* Documents View */}
      {selectedView === 'documents' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                className="bg-surface border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push('/docs')}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{doc.icon}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(doc.type)}`}>
                    {doc.type}
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{doc.title}</h3>
                <div className="text-sm text-foreground-muted space-y-1">
                  <p>{doc.category}</p>
                  <div className="flex items-center justify-between">
                    <span>{new Date(doc.lastUpdated).toLocaleDateString()}</span>
                    {doc.size && <span>{doc.size}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 p-6 bg-surface border border-border rounded-lg">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/docs')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                View All Documents →
              </button>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg">
                Upload New
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Research View */}
      {selectedView === 'research' && (
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Grant Concepts by Score</h3>
            <div className="space-y-3">
              {filteredResearch.map(concept => (
                <div
                  key={concept.id}
                  className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => router.push('/research')}
                >
                  <div>
                    <h4 className="font-medium">{concept.title}</h4>
                    <p className="text-sm text-foreground-muted">{concept.field}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-bold ${
                      concept.sdsScore >= 30 ? 'text-green-600 dark:text-green-400' :
                      concept.sdsScore >= 25 ? 'text-amber-600 dark:text-amber-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`}>
                      {concept.sdsScore}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      concept.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-secondary text-foreground-muted'
                    }`}>
                      {concept.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push('/research')}
              className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              View Full Research →
            </button>
          </div>
        </div>
      )}

      {/* Memory View */}
      {selectedView === 'memory' && (
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Institutional Memory</h3>
            <div className="space-y-3">
              {filteredMemory.map(entry => (
                <div
                  key={entry.id}
                  className="p-4 bg-background rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getMemoryIcon(entry.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{entry.title}</h4>
                        <span className="text-sm text-foreground-muted">{entry.date}</span>
                      </div>
                      <p className="text-sm text-foreground-muted">{entry.summary}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push('/memory')}
              className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              View Full Memory →
            </button>
          </div>

          {/* Memory Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Decisions Made', count: memoryEntries.filter(e => e.type === 'decision').length, icon: '🎯' },
              { label: 'Insights Captured', count: memoryEntries.filter(e => e.type === 'insight').length, icon: '💡' },
              { label: 'Milestones Reached', count: memoryEntries.filter(e => e.type === 'milestone').length, icon: '🏁' },
              { label: 'Lessons Learned', count: memoryEntries.filter(e => e.type === 'learning').length, icon: '📚' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-surface border border-border rounded-lg p-4 text-center">
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-2xl font-bold mt-2">{stat.count}</p>
                <p className="text-sm text-foreground-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}