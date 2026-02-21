'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface StrategyDetail {
  slug: string
  title: string
  content: string
  badge?: string
}

// Basic markdown to HTML (handles headers, bold, italic, lists, links, hr)
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2 text-amber-400">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3 text-foreground">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h1>')
    .replace(/^---$/gm, '<hr class="border-border my-6" />')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-foreground-muted">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-foreground-muted">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-amber-400 hover:underline" target="_blank">$1</a>')
    .replace(/^(?!<[hlu]|<li|<hr|<a)(.+)$/gm, '<p class="text-foreground-muted mb-3 leading-relaxed">$1</p>')
    .replace(/<\/li>\n<li/g, '</li><li')
}

export default function StrategyDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [doc, setDoc] = useState<StrategyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/api/strategy?slug=${slug}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setDoc)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="p-8 max-w-4xl mx-auto"><p className="text-foreground-muted">Loading...</p></div>
  if (error || !doc) return <div className="p-8 max-w-4xl mx-auto"><p className="text-red-400">Document not found</p><Link href="/strategy" className="text-amber-400 hover:underline mt-4 inline-block">← Back to Strategy</Link></div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/strategy" className="text-amber-400 hover:underline text-sm mb-6 inline-block">← Back to Strategy</Link>
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">{doc.title}</h1>
        {doc.badge && (
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold">{doc.badge}</span>
        )}
      </div>
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(doc.content) }}
      />
    </div>
  )
}
