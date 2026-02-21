'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Person, OutreachDocument } from '@/lib/types'

export default function PersonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [person, setPerson] = useState<Person | null>(null)
  const [documents, setDocuments] = useState<OutreachDocument[]>([])
  const [allDocuments, setAllDocuments] = useState<OutreachDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [emailDraft, setEmailDraft] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editingDoc, setEditingDoc] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [draftDirty, setDraftDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPerson()
    fetchLinkedDocuments()
  }, [params.id])

  async function fetchPerson() {
    try {
      const res = await fetch(`/api/people/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setPerson(data)
        // Load saved email draft
        if (data.email_draft) {
          const draft = typeof data.email_draft === 'string' 
            ? JSON.parse(data.email_draft) 
            : data.email_draft
          setEmailSubject(draft.subject || '')
          setEmailDraft(draft.body || '')
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function fetchLinkedDocuments() {
    try {
      const res = await fetch('/api/outreach-documents')
      if (res.ok) {
        const all: OutreachDocument[] = await res.json()
        setAllDocuments(all)
        setDocuments(all.filter(d => d.linked_contacts.includes(params.id as string)))
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function linkDocument(docId: string) {
    await fetch('/api/outreach-documents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: docId,
        linked_contacts: [...(allDocuments.find(d => d.id === docId)?.linked_contacts || []), params.id],
      }),
    })
    fetchLinkedDocuments()
    setShowLinkModal(false)
  }

  async function unlinkDocument(docId: string) {
    const doc = documents.find(d => d.id === docId)
    if (!doc) return
    await fetch('/api/outreach-documents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: docId,
        linked_contacts: doc.linked_contacts.filter(id => id !== params.id),
      }),
    })
    fetchLinkedDocuments()
  }

  async function saveDocContent(docId: string) {
    await fetch('/api/outreach-documents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: docId, content: editContent }),
    })
    setEditingDoc(null)
    fetchLinkedDocuments()
  }

  async function saveDraft() {
    if (!person) return
    setSaving(true)
    try {
      await fetch(`/api/people/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_draft: JSON.stringify({
            subject: emailSubject,
            body: emailDraft,
            updated_at: new Date().toISOString(),
          }),
        }),
      })
      setDraftDirty(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  function handleDraftChange(field: 'subject' | 'body', value: string) {
    if (field === 'subject') setEmailSubject(value)
    else setEmailDraft(value)
    setDraftDirty(true)
  }

  function copyEmail() {
    const text = emailSubject ? `Subject: ${emailSubject}\n\n${emailDraft}` : emailDraft
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyBodyOnly() {
    navigator.clipboard.writeText(emailDraft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function openInEmailClient() {
    const email = person?.contact_info?.email || ''
    const mailto = `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailDraft)}`
    window.open(mailto)
  }

  if (loading) return <div className="p-8 text-foreground-muted">Loading...</div>
  if (!person) return <div className="p-8 text-foreground-muted">Person not found</div>

  const unlinkedDocs = allDocuments.filter(d => !d.linked_contacts.includes(params.id as string))

  return (
    <div className="p-8 max-w-5xl overflow-y-auto h-full">
      <Link href="/people" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
        ← Back to People
      </Link>

      {/* Header */}
      <div className="bg-surface rounded-lg border border-border p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold">{person.name}</h1>
          {person.nickname && <span className="text-foreground-muted">({person.nickname})</span>}
          <span className="text-xs px-2 py-0.5 bg-surface-hover rounded">{person.relationship}</span>
          {person.outreach_status && (
            <span className="text-xs px-2 py-0.5 bg-blue-900/40 text-blue-300 border border-blue-500/30 rounded">
              {person.outreach_status}
            </span>
          )}
        </div>

        {person.organization && <p className="text-foreground-muted mb-2">🏢 {person.organization}</p>}
        {person.cases && person.cases.length > 0 && (
          <p className="text-foreground-muted mb-2">⚖️ {person.cases.join(' · ')}</p>
        )}
        {person.profile_notes && <p className="text-foreground-muted mb-4">{person.profile_notes}</p>}

        {/* Contact Info */}
        {person.contact_info && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {person.contact_info.email && <p>📧 {person.contact_info.email}</p>}
            {person.contact_info.phone && <p>📱 {person.contact_info.phone}</p>}
            {person.contact_info.linkedin && <p>💼 {person.contact_info.linkedin}</p>}
            {person.contact_info.twitter && <p>🐦 {person.contact_info.twitter}</p>}
            {person.contact_info.other && <p>📎 {person.contact_info.other}</p>}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4 text-xs">
          {person.last_contact && (
            <span className="px-2 py-1 bg-green-900/30 text-green-300 rounded">
              Last contact: {new Date(person.last_contact).toLocaleDateString()}
            </span>
          )}
          {person.followup_reminder && (
            <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded">
              Remind: {new Date(person.followup_reminder).toLocaleDateString()}
            </span>
          )}
          {person.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-surface-hover rounded text-foreground-muted">#{tag}</span>
          ))}
        </div>
      </div>

      {/* Outreach / Email Section */}
      <div className="bg-surface rounded-lg border border-border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">📧 Outreach Email</h2>
          <div className="flex items-center gap-2">
            {draftDirty && (
              <span className="text-xs text-yellow-400">Unsaved changes</span>
            )}
            {emailDraft && (
              <button
                onClick={saveDraft}
                disabled={saving || !draftDirty}
                className="px-3 py-1.5 bg-green-700 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : '💾 Save Draft'}
              </button>
            )}
          </div>
        </div>
        
        {!emailDraft ? (
          <div className="text-center py-8">
            <p className="text-foreground-muted mb-4">No email draft yet for this contact.</p>
            <p className="text-foreground-muted text-sm">Ask Daisy to generate a draft, or write one manually below.</p>
            <button
              onClick={() => {
                setEmailSubject('')
                setEmailDraft('')
                setDraftDirty(true)
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              ✏️ Start Writing
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-foreground-muted">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={e => handleDraftChange('subject', e.target.value)}
                className="w-full bg-surface-hover border border-border rounded px-3 py-2 text-foreground"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-foreground-muted">Body</label>
              <textarea
                rows={16}
                value={emailDraft}
                onChange={e => handleDraftChange('body', e.target.value)}
                className="w-full bg-surface-hover border border-border rounded px-3 py-2 text-foreground font-mono text-sm leading-relaxed"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={copyEmail} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                {copied ? '✓ Copied!' : '📋 Copy Full Email (Subject + Body)'}
              </button>
              <button onClick={copyBodyOnly} className="px-4 py-2 bg-surface-hover border border-border rounded hover:bg-surface text-sm">
                📋 Copy Body Only
              </button>
              {person.contact_info?.email && (
                <button onClick={openInEmailClient} className="px-4 py-2 bg-surface-hover border border-border rounded hover:bg-surface text-sm">
                  📨 Open in Email Client
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Linked Documents */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">📎 Linked Documents</h2>
          <button
            onClick={() => setShowLinkModal(true)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            + Link Document
          </button>
        </div>

        {documents.length === 0 ? (
          <p className="text-foreground-muted text-sm">No documents linked to this contact. Use the button above to link relevant documents.</p>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc.id} className="bg-surface-hover rounded border border-border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{doc.title}</h3>
                    <p className="text-xs text-foreground-muted">{doc.category} · {doc.filename}</p>
                  </div>
                  <div className="flex gap-2">
                    {doc.content && (
                      <button
                        onClick={() => {
                          if (editingDoc === doc.id) {
                            setEditingDoc(null)
                          } else {
                            setEditingDoc(doc.id)
                            setEditContent(doc.content || '')
                          }
                        }}
                        className="px-2 py-1 text-xs bg-surface border border-border rounded hover:bg-surface-hover"
                      >
                        {editingDoc === doc.id ? 'Close' : 'View/Edit'}
                      </button>
                    )}
                    {doc.file_path && (
                      <a
                        href={`/api/outreach-documents/${doc.id}/download`}
                        className="px-2 py-1 text-xs bg-surface border border-border rounded hover:bg-surface-hover"
                      >
                        ⬇ Download
                      </a>
                    )}
                    <button
                      onClick={() => unlinkDocument(doc.id)}
                      className="px-2 py-1 text-xs bg-red-900/50 text-red-200 rounded hover:bg-red-900"
                    >
                      Unlink
                    </button>
                  </div>
                </div>
                {editingDoc === doc.id && (
                  <div className="mt-3">
                    <textarea
                      rows={10}
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      className="w-full bg-surface border border-border rounded px-3 py-2 text-foreground font-mono text-sm"
                    />
                    <button
                      onClick={() => saveDocContent(doc.id)}
                      className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link Document Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg border border-border p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Link Document</h3>
              <button onClick={() => setShowLinkModal(false)} className="text-foreground-muted hover:text-foreground">✕</button>
            </div>
            {unlinkedDocs.length === 0 ? (
              <p className="text-foreground-muted text-sm">No unlinked documents available. Upload documents in the 📎 Documents section first.</p>
            ) : (
              <div className="space-y-2">
                {unlinkedDocs.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => linkDocument(doc.id)}
                    className="w-full text-left p-3 bg-surface-hover rounded border border-border hover:border-foreground-muted"
                  >
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-xs text-foreground-muted">{doc.category} · {doc.filename}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
