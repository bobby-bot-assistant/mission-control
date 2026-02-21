'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type CaptureMode = 'task' | 'memory' | 'note' | null

export default function QuickCaptureWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<CaptureMode>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const router = useRouter()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + C for capture
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'c') {
        e.preventDefault()
        setIsOpen(true)
        setMode(null)
      }
      
      // Cmd/Ctrl + Enter to save when capture is open
      if (isOpen && mode && (e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleCapture()
      }
      
      // Escape to close
      if (isOpen && e.key === 'Escape') {
        setIsOpen(false)
        setMode(null)
        setContent('')
        setTitle('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, mode, content, title])

  const handleCapture = async () => {
    if (!content.trim()) return

    try {
      if (mode === 'task') {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || content.slice(0, 50),
            description: content,
            status: '📥 Backlog (captured but not started)',
            priority: '🟡 Medium'
          })
        })
        router.push('/tasks')
      } else if (mode === 'memory') {
        await fetch('/api/memories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || content.slice(0, 50),
            content: content,
            category: '💡 Idea Captured',
            memory_date: new Date().toISOString().split('T')[0],
            tags: ['quick-capture']
          })
        })
        router.push('/memory')
      } else if (mode === 'note') {
        await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || `Quick Note - ${new Date().toLocaleString()}`,
            type: '📝 Note / Scratchpad',
            content: content,
            tags: ['quick-capture']
          })
        })
        router.push('/docs')
      }

      // Reset after capture
      setContent('')
      setTitle('')
      setMode(null)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to capture:', error)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
        title="Quick Capture (⌘⇧C)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    )
  }

  return (
    <div className={`fixed ${isMinimized ? 'bottom-6 right-6' : 'bottom-6 right-6'} z-50`}>
      <div className={`bg-surface rounded-lg shadow-2xl border border-border ${
        isMinimized ? 'w-64' : 'w-96'
      } transition-all`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Quick Capture</h3>
            {mode && (
              <span className="text-xs px-2 py-1 bg-secondary rounded">
                {mode === 'task' && '✅ Task'}
                {mode === 'memory' && '🧠 Memory'}
                {mode === 'note' && '📝 Note'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-surface-hover rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMinimized ? "M4 8h16M4 16h16" : "M20 12H4"} />
              </svg>
            </button>
            <button
              onClick={() => {
                setIsOpen(false)
                setMode(null)
                setContent('')
                setTitle('')
              }}
              className="p-1 hover:bg-surface-hover rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mode Selection */}
        {!mode && !isMinimized && (
          <div className="p-4 grid grid-cols-3 gap-2">
            <button
              onClick={() => setMode('task')}
              className="p-4 bg-background-subtle hover:bg-surface-hover rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-1">✅</div>
              <div className="text-sm">Task</div>
            </button>
            <button
              onClick={() => setMode('memory')}
              className="p-4 bg-background-subtle hover:bg-surface-hover rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-1">🧠</div>
              <div className="text-sm">Memory</div>
            </button>
            <button
              onClick={() => setMode('note')}
              className="p-4 bg-background-subtle hover:bg-surface-hover rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-1">📝</div>
              <div className="text-sm">Note</div>
            </button>
          </div>
        )}

        {/* Capture Form */}
        {mode && !isMinimized && (
          <div className="p-4 space-y-3">
            {mode !== 'memory' && (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full px-3 py-2 bg-background-subtle border border-border rounded-lg"
                autoFocus
              />
            )}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                mode === 'task' ? 'What needs to be done?' :
                mode === 'memory' ? 'What should I remember?' :
                'Quick note...'
              }
              className="w-full px-3 py-2 bg-background-subtle border border-border rounded-lg resize-none"
              rows={isMinimized ? 2 : 4}
              autoFocus={mode === 'memory'}
            />
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMode(null)}
                className="px-3 py-1 text-sm text-foreground-subtle hover:text-foreground"
              >
                ← Back
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground-subtle">⌘↵ to save</span>
                <button
                  onClick={handleCapture}
                  disabled={!content.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Capture
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Minimized State */}
        {isMinimized && (
          <div className="p-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Quick capture..."
              className="w-full px-2 py-1 bg-background-subtle border border-border rounded text-sm resize-none"
              rows={2}
            />
          </div>
        )}
      </div>
    </div>
  )
}