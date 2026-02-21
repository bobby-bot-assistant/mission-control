'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Project, Task, Memory, Person, Document } from '@/lib/types'

interface SearchResult {
  id: string
  type: 'project' | 'task' | 'memory' | 'person' | 'document' | 'action'
  title: string
  subtitle?: string
  icon: string
  action: () => void
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Data fetching
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [documents, setDocuments] = useState<Document[]>([])

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [projectsRes, tasksRes, memoriesRes, peopleRes, docsRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/tasks'),
          fetch('/api/memories'),
          fetch('/api/people'),
          fetch('/api/documents')
        ])

        if (projectsRes.ok) setProjects(await projectsRes.json())
        if (tasksRes.ok) setTasks(await tasksRes.json())
        if (memoriesRes.ok) setMemories(await memoriesRes.json())
        if (peopleRes.ok) setPeople(await peopleRes.json())
        if (docsRes.ok) setDocuments(await docsRes.json())
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
  }, [])

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(!isOpen)
        setQuery('')
        setSelectedIndex(0)
      }
      
      if (isOpen) {
        if (e.key === 'Escape') {
          setIsOpen(false)
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex(i => Math.min(i + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter' && results[selectedIndex]) {
          e.preventDefault()
          results[selectedIndex].action()
          setIsOpen(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  // Search function
  const search = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      // Show quick actions when empty
      setResults([
        {
          id: 'create-task',
          type: 'action',
          title: 'Create new task',
          icon: '➕',
          action: () => router.push('/tasks?action=new')
        },
        {
          id: 'capture-memory',
          type: 'action',
          title: 'Capture memory',
          icon: '🧠',
          action: () => router.push('/memory?action=capture')
        },
        {
          id: 'add-person',
          type: 'action',
          title: 'Add person',
          icon: '👤',
          action: () => router.push('/people?action=new')
        },
        {
          id: 'create-document',
          type: 'action',
          title: 'Create document',
          icon: '📄',
          action: () => router.push('/docs?action=new')
        }
      ])
      return
    }

    const q = searchQuery.toLowerCase()
    const searchResults: SearchResult[] = []

    // Search projects
    projects.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.vision.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    ).forEach(project => {
      searchResults.push({
        id: project.id,
        type: 'project',
        title: project.name,
        subtitle: project.status,
        icon: '📁',
        action: () => router.push(`/projects?highlight=${project.id}`)
      })
    })

    // Search tasks
    tasks.filter(t => 
      t.title.toLowerCase().includes(q) || 
      (t.description && t.description.toLowerCase().includes(q))
    ).forEach(task => {
      searchResults.push({
        id: task.id,
        type: 'task',
        title: task.title,
        subtitle: task.status,
        icon: '✅',
        action: () => router.push(`/tasks?highlight=${task.id}`)
      })
    })

    // Search memories
    memories.filter(m => 
      m.title.toLowerCase().includes(q) || 
      m.content.toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q))
    ).forEach(memory => {
      searchResults.push({
        id: memory.id,
        type: 'memory',
        title: memory.title,
        subtitle: memory.category,
        icon: '🧠',
        action: () => router.push(`/memory?highlight=${memory.id}`)
      })
    })

    // Search people
    people.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.organization && p.organization.toLowerCase().includes(q)) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    ).forEach(person => {
      searchResults.push({
        id: person.id,
        type: 'person',
        title: person.name,
        subtitle: person.relationship,
        icon: '👤',
        action: () => router.push(`/people?highlight=${person.id}`)
      })
    })

    // Search documents
    documents.filter(d => 
      d.title.toLowerCase().includes(q) || 
      (d.summary && d.summary.toLowerCase().includes(q)) ||
      d.tags.some(t => t.toLowerCase().includes(q))
    ).forEach(doc => {
      searchResults.push({
        id: doc.id,
        type: 'document',
        title: doc.title,
        subtitle: doc.type,
        icon: '📄',
        action: () => router.push(`/docs?highlight=${doc.id}`)
      })
    })

    // Add navigation results
    const pages = [
      { path: '/executive', title: 'Executive Home', icon: '🎯' },
      { path: '/projects', title: 'Projects', icon: '📁' },
      { path: '/tasks', title: 'Tasks', icon: '✅' },
      { path: '/memory', title: 'Memory Vault', icon: '🧠' },
      { path: '/people', title: 'People CRM', icon: '👥' },
      { path: '/docs', title: 'Documents', icon: '📄' },
      { path: '/activity', title: 'Activity Feed', icon: '📊' }
    ]

    pages.filter(p => p.title.toLowerCase().includes(q)).forEach(page => {
      searchResults.push({
        id: `nav-${page.path}`,
        type: 'action',
        title: `Go to ${page.title}`,
        icon: page.icon,
        action: () => router.push(page.path)
      })
    })

    setResults(searchResults.slice(0, 10))
  }, [projects, tasks, memories, people, documents, router])

  // Update search results when query changes
  useEffect(() => {
    search(query)
  }, [query, search])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
      
      <div className="relative min-h-screen flex items-start justify-center pt-[20vh]">
        <div className="relative bg-surface rounded-lg shadow-2xl w-full max-w-2xl mx-4">
          {/* Search Input */}
          <div className="flex items-center border-b border-border">
            <div className="pl-4 pr-2 py-4">
              <svg className="w-5 h-5 text-foreground-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or type a command..."
              className="flex-1 px-2 py-4 bg-transparent outline-none text-lg"
              autoFocus
            />
            <div className="px-4 py-4 text-sm text-foreground-subtle">
              ESC to close
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-auto">
            {results.length === 0 ? (
              <div className="p-8 text-center text-foreground-subtle">
                {query ? 'No results found' : 'Start typing to search...'}
              </div>
            ) : (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      result.action()
                      setIsOpen(false)
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                      index === selectedIndex 
                        ? 'bg-secondary' 
                        : 'hover:bg-surface-hover/50'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{result.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-sm text-foreground-subtle">{result.subtitle}</div>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-xs text-foreground-subtle">
                      {index === selectedIndex && '↵'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-3 flex items-center justify-between text-xs text-foreground-subtle">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
            <div>
              ⌘K Command Palette
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}