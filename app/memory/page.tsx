'use client'

import { useEffect, useState } from 'react'
import { Memory, MemoryCategory } from '@/lib/types'

const CATEGORY_OPTIONS: MemoryCategory[] = [
  '🎯 Decision Made (and reasoning)',
  '📚 Learning / Insight',
  '💡 Idea Captured',
  '🔑 Key Context (background info)',
  '⚠️ Mistake / Lesson Learned',
  '🏆 Win / Achievement',
  '📌 Reference',
]

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [quickCapture, setQuickCapture] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<MemoryCategory | 'All'>('All')
  const [showFullForm, setShowFullForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '🎯 Decision Made (and reasoning)' as MemoryCategory,
    why_it_matters: '',
    tags: '',
    memory_date: new Date().toISOString().split('T')[0],
  })

  async function fetchMemories() {
    try {
      const url = searchQuery 
        ? `/api/memories?q=${encodeURIComponent(searchQuery)}`
        : '/api/memories'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setMemories(data)
      }
    } catch (error) {
      console.error('Failed to fetch memories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMemories()
  }, [searchQuery])

  async function handleQuickCapture(e: React.FormEvent) {
    e.preventDefault()
    if (!quickCapture.trim()) return

    const title = quickCapture.slice(0, 50) + (quickCapture.length > 50 ? '...' : '')
    
    await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content: quickCapture,
        category: '📚 Learning / Insight',
        memory_date: new Date().toISOString().split('T')[0],
        tags: ['quick-capture'],
      }),
    })
    
    setQuickCapture('')
    fetchMemories()
  }

  async function handleFullSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      }),
    })
    
    setFormData({
      title: '',
      content: '',
      category: '🎯 Decision Made (and reasoning)',
      why_it_matters: '',
      tags: '',
      memory_date: new Date().toISOString().split('T')[0],
    })
    setShowFullForm(false)
    fetchMemories()
  }

  const filteredMemories = categoryFilter === 'All' 
    ? memories 
    : memories.filter(m => m.category === categoryFilter)

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Memory Vault</h1>
        <p className="text-zinc-500">Loading memories...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Memory Vault</h1>
        <p className="text-zinc-500">{memories.length} memory{ memories.length !== 1 ? 'ies' : ''}</p>
      </div>

      {/* Quick Capture */}
      <div className="mb-8">
        <form onSubmit={handleQuickCapture} className="flex gap-2">
          <input
            type="text"
            value={quickCapture}
            onChange={e => setQuickCapture(e.target.value)}
            placeholder="Quick capture... (Enter to save, Shift+Enter for new line)"
            className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-3 text-zinc-900 dark:text-zinc-100"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Capture
          </button>
        </form>
        <button
          onClick={() => setShowFullForm(!showFullForm)}
          className="mt-2 text-sm text-zinc-500 hover:text-zinc-300"
        >
          {showFullForm ? '− Hide full form' : '+ Show full form'}
        </button>
      </div>

      {/* Full Form */}
      {showFullForm && (
        <form onSubmit={handleFullSubmit} className="mb-8 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-zinc-900 dark:text-zinc-100"
                placeholder="Brief descriptive title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content *</label>
              <textarea
                required
                rows={4}
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-zinc-900 dark:text-zinc-100"
                placeholder="Full memory content..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as MemoryCategory })}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-zinc-900 dark:text-zinc-100"
                >
                  {CATEGORY_OPTIONS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={formData.memory_date}
                  onChange={e => setFormData({ ...formData, memory_date: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Why it matters</label>
              <input
                type="text"
                value={formData.why_it_matters}
                onChange={e => setFormData({ ...formData, why_it_matters: e.target.value })}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-zinc-900 dark:text-zinc-100"
                placeholder="Brief note on importance"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-zinc-900 dark:text-zinc-100"
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Save Memory
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search memories..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('All')}
          className={`px-3 py-1 rounded-full text-sm ${
            categoryFilter === 'All' ? 'bg-zinc-800 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400'
          }`}
        >
          All
        </button>
        {CATEGORY_OPTIONS.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded-full text-sm ${
              categoryFilter === cat ? 'bg-zinc-800 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400'
            }`}
          >
            {cat.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filteredMemories.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <p className="text-4xl mb-4">🧠</p>
          <p className="text-lg font-medium mb-2">No memories yet</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Capture your first memory above</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMemories.map((memory) => (
            <div 
              key={memory.id}
              className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4"
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl">{memory.category.split(' ')[0]}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{memory.title}</h3>
                    <span className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-700 dark:text-zinc-400">
                      {new Date(memory.memory_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-2 whitespace-pre-wrap">{memory.content}</p>
                  {memory.why_it_matters && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">💡 {memory.why_it_matters}</p>
                  )}
                  {memory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {memory.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
