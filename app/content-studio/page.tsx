'use client'

import { useState, useEffect, Fragment, useRef } from 'react'

// ─── Types ───────────────────────────────────────────────────────

interface FeedbackEntry {
  id: string
  author: string
  note: string
  timestamp: string
  action: string
}

interface ContentItem {
  type: 'blog' | 'linkedin_article' | 'linkedin_native' | 'x_thread' | 'video'
  title: string
  category: 'mission' | 'builders_log' | 'product'
  status: ItemStatus
  owner: string
  draftText?: string
  tweets?: string[]
  hook?: string
  talkingPoints?: string[]
  feedbackHistory: FeedbackEntry[]
  approvedAt: string | null
  sentAt: string | null
  archivedAt: string | null
}

interface CalendarDay {
  date: string
  dayType: 'anchor' | 'engagement' | 'standalone' | 'video' | 'weekend'
  label: string
  items: ContentItem[]
}

interface ContentCalendar {
  metadata: {
    cadence: string
    ratioTarget: string
    categories: { [key: string]: { color: string; label: string } }
  }
  days: CalendarDay[]
  ratioMetrics: {
    month: string
    mission: number
    builders_log: number
    product: number
    total: number
    ratio: string
  }
}

// ─── Constants ──────────────────────────────────────────────────

type ItemStatus = 'draft' | 'in_review' | 'changes_requested' | 'revised' | 'approved' | 'sent' | 'archived'

const STATUS_CONFIG: Record<ItemStatus, { label: string; color: string; bg: string; border: string }> = {
  draft: { label: 'Draft', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  in_review: { label: 'In Review', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  changes_requested: { label: 'Changes', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  revised: { label: 'Revised', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  approved: { label: 'Approved', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
  sent: { label: 'Sent', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  archived: { label: 'Archived', color: 'text-gray-500', bg: 'bg-gray-600/20', border: 'border-gray-600/30' }
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; shortLabel: string }> = {
  blog: { label: 'Blog Post', icon: '📝', shortLabel: 'Blog' },
  linkedin_article: { label: 'LinkedIn Article', icon: '💼', shortLabel: 'LI Article' },
  linkedin_native: { label: 'LinkedIn Native', icon: '💬', shortLabel: 'LI Post' },
  x_thread: { label: 'X Thread', icon: '🐦', shortLabel: 'X Thread' },
  video: { label: 'Video', icon: '🎥', shortLabel: 'Video' }
}

const DAY_TYPE_LABELS: Record<string, string> = {
  anchor: 'Anchor (Mon)',
  engagement: 'Engagement',
  standalone: 'Standalone (Thu)',
  video: 'Video (Fri)',
  weekend: 'Weekend'
}

const CONTENT_TYPES: ContentItem['type'][] = ['blog', 'linkedin_article', 'linkedin_native', 'x_thread', 'video']

// ─── Editable Content Component ─────────────────────────────────

function EditableContent({
  item, dayDate, itemIndex, onUpdate, disabled
}: {
  item: ContentItem
  dayDate: string
  itemIndex: number
  onUpdate: (d: string, i: number, u: any) => Promise<void>
  disabled: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(item.draftText || '')
  const [editTweets, setEditTweets] = useState<string[]>(item.tweets || [])
  const [editTalkingPoints, setEditTalkingPoints] = useState<string[]>(item.talkingPoints || [])
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Reset state when item changes
  useEffect(() => {
    setEditText(item.draftText || '')
    setEditTweets(item.tweets || [])
    setEditTalkingPoints(item.talkingPoints || [])
    setIsEditing(false)
  }, [item.draftText, item.tweets, item.talkingPoints, itemIndex])

  const handleSave = async () => {
    setSaving(true)
    try {
      const update: any = { draftText: editText }
      if (item.type === 'x_thread') {
        update.tweets = editTweets
      }
      if (item.type === 'video') {
        update.talkingPoints = editTalkingPoints
      }
      await onUpdate(dayDate, itemIndex, update)
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditText(item.draftText || '')
    setEditTweets(item.tweets || [])
    setEditTalkingPoints(item.talkingPoints || [])
    setIsEditing(false)
  }

  // For X Thread editing
  const handleTweetChange = (idx: number, value: string) => {
    const newTweets = [...editTweets]
    newTweets[idx] = value
    setEditTweets(newTweets)
  }

  // For Video script editing  
  const handleTalkingPointChange = (idx: number, value: string) => {
    const newPoints = [...editTalkingPoints]
    newPoints[idx] = value
    setEditTalkingPoints(newPoints)
  }

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Edit modes based on content type */}
        {(item.type === 'linkedin_article' || item.type === 'linkedin_native' || item.type === 'blog') && (
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Content
            </label>
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="w-full h-64 p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500 resize-y"
              placeholder="Write your content here..."
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {editText.split(/\s+/).filter(Boolean).length} words · {editText.length} characters
            </div>
          </div>
        )}

        {item.type === 'x_thread' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Opening Tweet
              </label>
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="w-full h-24 p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500 resize-y"
                placeholder="Opening tweet..."
              />
            </div>
            {editTweets.map((tweet, idx) => (
              <div key={idx}>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Tweet {idx + 2}
                </label>
                <textarea
                  value={tweet}
                  onChange={e => handleTweetChange(idx, e.target.value)}
                  className="w-full h-20 p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500 resize-y"
                />
              </div>
            ))}
            <button
              onClick={() => setEditTweets([...editTweets, ''])}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
            >
              + Add Tweet
            </button>
          </div>
        )}

        {item.type === 'video' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Full Script (for 2-3 minute video)
              </label>
              <textarea
                value={editTalkingPoints.join('\n\n')}
                onChange={e => setEditTalkingPoints(e.target.value.split('\n\n').filter(Boolean))}
                className="w-full h-80 p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500 resize-y"
                placeholder="Write the full video script here...

Format:
[HOOK - 15 sec]
Your opening hook here...

[MAIN CONTENT - 2 min]
Your main content with transitions here...

[CTA - 15 sec]
Your call to action here..."
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Write conversationally as you'd speak on camera. Include timing markers: HOOK, MAIN CONTENT, CTA.
            </div>
          </div>
        )}

        {/* Save/Cancel buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // View mode - show Edit button
  return (
    <div className="flex justify-end mb-3">
      <button
        onClick={() => setIsEditing(true)}
        disabled={disabled}
        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Edit
      </button>
    </div>
  )
}

// ─── Utils ──────────────────────────────────────────────────────

function formatDate(dateString: string) {
  const date = new Date(dateString + 'T12:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function isToday(dateString: string) {
  return dateString === new Date().toISOString().split('T')[0]
}

function getTextStats(text: string) {
  if (!text) return { chars: 0, words: 0 }
  return { chars: text.length, words: text.split(/\s+/).filter(Boolean).length }
}

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  })
}

function getTwoWeeksRange() {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - today.getDay())
  const end = new Date(start)
  end.setDate(start.getDate() + 20) // ~3 weeks to capture more content
  return { start, end }
}

// ─── Small Components ───────────────────────────────────────────

function StatusBadge({ status }: { status: ItemStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}>
      {config.label}
    </span>
  )
}

function WorkflowActions({
  item, dayDate, itemIndex, onUpdate, updating
}: {
  item: ContentItem
  dayDate: string
  itemIndex: number
  onUpdate: (d: string, i: number, u: any) => Promise<void>
  updating: boolean
}) {
  const [feedbackNote, setFeedbackNote] = useState('')
  const [showInput, setShowInput] = useState(false)

  const act = async (status: string, note?: string) => {
    await onUpdate(dayDate, itemIndex, {
      status,
      feedbackNote: note || undefined,
      action: status,
      author: 'reviewer'
    })
    setFeedbackNote('')
    setShowInput(false)
  }

  const btnBase = 'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50'

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {item.status === 'draft' && (
          <button onClick={() => act('in_review')} disabled={updating}
            className={`${btnBase} bg-blue-600 hover:bg-blue-500 text-white`}>
            Submit for Review
          </button>
        )}
        {item.status === 'in_review' && (
          <>
            <button onClick={() => setShowInput(!showInput)} disabled={updating}
              className={`${btnBase} bg-orange-600 hover:bg-orange-500 text-white`}>
              Request Changes
            </button>
            <button onClick={() => act('approved')} disabled={updating}
              className={`${btnBase} bg-green-600 hover:bg-green-500 text-white`}>
              Approve
            </button>
          </>
        )}
        {item.status === 'changes_requested' && (
          <button onClick={() => act('revised')} disabled={updating}
            className={`${btnBase} bg-purple-600 hover:bg-purple-500 text-white`}>
            Mark Revised
          </button>
        )}
        {item.status === 'revised' && (
          <button onClick={() => act('in_review')} disabled={updating}
            className={`${btnBase} bg-blue-600 hover:bg-blue-500 text-white`}>
            Re-submit for Review
          </button>
        )}
        {item.status === 'approved' && (
          <button onClick={() => act('sent')} disabled={updating}
            className={`${btnBase} bg-emerald-600 hover:bg-emerald-500 text-white`}>
            Mark as Sent
          </button>
        )}
      </div>

      {showInput && (
        <div className="space-y-2">
          <textarea
            value={feedbackNote}
            onChange={e => setFeedbackNote(e.target.value)}
            placeholder="Describe the changes needed..."
            className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={() => act('changes_requested', feedbackNote)}
              disabled={updating || !feedbackNote.trim()}
              className={`${btnBase} bg-orange-600 hover:bg-orange-500 text-white`}>
              Submit Feedback
            </button>
            <button onClick={() => { setShowInput(false); setFeedbackNote('') }}
              className={`${btnBase} bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300`}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FeedbackThread({ history }: { history: FeedbackEntry[] }) {
  if (!history || history.length === 0) return null
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Feedback History</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {[...history].reverse().map(entry => (
          <div key={entry.id} className="flex gap-3 text-xs">
            <div className="w-1 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="font-medium text-gray-700 dark:text-gray-300">{entry.author}</span>
                <span className="text-gray-400 dark:text-gray-600">&middot;</span>
                <span className="text-gray-500 dark:text-gray-500">{formatTimestamp(entry.timestamp)}</span>
                {entry.action && entry.action !== 'note' && (
                  <StatusBadge status={entry.action as ItemStatus} />
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">{entry.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FullCopyDisplay({ item }: { item: ContentItem }) {
  if (item.type === 'x_thread') {
    const allTweets = [item.draftText, ...(item.tweets || [])].filter(Boolean) as string[]
    const totalChars = allTweets.reduce((sum, t) => sum + t.length, 0)
    return (
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          X Thread ({allTweets.length} tweet{allTweets.length !== 1 ? 's' : ''})
        </h4>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {allTweets.map((tweet, idx) => (
            <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">Tweet {idx + 1}</span>
                <span className={`text-xs ${tweet.length > 280 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-600'}`}>
                  {tweet.length}/280
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{tweet}</p>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500">{totalChars.toLocaleString()} total chars</div>
      </div>
    )
  }

  if (item.type === 'video') {
    return (
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Video Script</h4>
        {item.talkingPoints && item.talkingPoints.length > 0 ? (
          <div className="space-y-3">
            {item.talkingPoints.map((point, idx) => (
              <div key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                {point}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-500 italic">No script yet</p>
        )}
      </div>
    )
  }

  // LinkedIn Article, LinkedIn Native, Blog
  const text = item.draftText || ''
  const stats = getTextStats(text)

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {TYPE_CONFIG[item.type]?.label || item.type} Draft
      </h4>
      {item.hook && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Hook:</div>
          <p className="text-sm text-blue-800 dark:text-blue-200 italic">&ldquo;{item.hook}&rdquo;</p>
        </div>
      )}
      {text ? (
        <>
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto pr-1">
            {text}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {stats.chars.toLocaleString()} chars &middot; {stats.words.toLocaleString()} words
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-500 italic">No draft copy yet</p>
      )}
    </div>
  )
}

// ─── Expanded Item Panel ────────────────────────────────────────

function ExpandedItemPanel({
  item, dayDate, itemIndex, onUpdate, updating
}: {
  item: ContentItem
  dayDate: string
  itemIndex: number
  onUpdate: (d: string, i: number, u: any) => Promise<void>
  updating: boolean
}) {
  return (
    <div className="mx-1 mb-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
        <span className="text-lg">{TYPE_CONFIG[item.type]?.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.title}</h3>
          <span className="text-xs text-gray-500 dark:text-gray-500">Owner: {item.owner}</span>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div className="p-4 space-y-4">
        {/* Edit Button */}
        <EditableContent
          item={item}
          dayDate={dayDate}
          itemIndex={itemIndex}
          onUpdate={onUpdate}
          disabled={updating}
        />

        {/* Full Copy */}
        <FullCopyDisplay item={item} />

        {/* Workflow Actions */}
        {item.status !== 'archived' && item.status !== 'sent' && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <WorkflowActions
              item={item}
              dayDate={dayDate}
              itemIndex={itemIndex}
              onUpdate={onUpdate}
              updating={updating}
            />
          </div>
        )}

        {/* Feedback History */}
        <FeedbackThread history={item.feedbackHistory} />

        {/* Timestamps */}
        <div className="text-xs text-gray-500 dark:text-gray-600 flex flex-wrap gap-3 border-t border-gray-200 dark:border-gray-700/50 pt-2">
          {item.approvedAt && <span className="text-green-600 dark:text-green-400">Approved {formatTimestamp(item.approvedAt)}</span>}
          {item.sentAt && <span className="text-emerald-600 dark:text-emerald-400">Sent {formatTimestamp(item.sentAt)}</span>}
          {item.archivedAt && <span className="text-gray-500">Archived {formatTimestamp(item.archivedAt)}</span>}
        </div>
      </div>
    </div>
  )
}

// ─── Today's Posts Queue ────────────────────────────────────────

function TodaysPostsQueue({
  todaysDay, onUpdate, updating
}: {
  todaysDay: CalendarDay | undefined
  onUpdate: (d: string, i: number, u: any) => Promise<void>
  updating: boolean
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const items = todaysDay?.items || []

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Today&apos;s Posts</h2>
      {items.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-500">No posts scheduled for today</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => {
            const typeConfig = TYPE_CONFIG[item.type]
            const isExpanded = expandedIdx === idx
            return (
              <div key={idx} className="bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg flex-shrink-0">{typeConfig?.icon}</span>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-500">{typeConfig?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <StatusBadge status={item.status} />
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {isExpanded && todaysDay && (
                  <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-4">
                    <EditableContent
                      item={item}
                      dayDate={todaysDay.date}
                      itemIndex={idx}
                      onUpdate={onUpdate}
                      disabled={updating}
                    />
                    <FullCopyDisplay item={item} />
                    {item.status !== 'archived' && item.status !== 'sent' && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <WorkflowActions item={item} dayDate={todaysDay.date} itemIndex={idx}
                          onUpdate={onUpdate} updating={updating} />
                      </div>
                    )}
                    <FeedbackThread history={item.feedbackHistory} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Ratio Meter ────────────────────────────────────────────────

function RatioMeter({ ratioMetrics, categories }: {
  ratioMetrics: ContentCalendar['ratioMetrics']
  categories: ContentCalendar['metadata']['categories']
}) {
  const total = ratioMetrics.total
  const missionPct = total > 0 ? (ratioMetrics.mission / total) * 100 : 0
  const buildersPct = total > 0 ? (ratioMetrics.builders_log / total) * 100 : 0
  const productPct = total > 0 ? (ratioMetrics.product / total) * 100 : 0
  const productHigh = ratioMetrics.product > Math.ceil(ratioMetrics.mission / 3)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Content Ratio &mdash; {ratioMetrics.month}</h2>
        {productHigh && (
          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-500/20 border border-orange-300 dark:border-orange-500/30 rounded-full text-orange-700 dark:text-orange-400 text-sm">
            Product ratio high
          </span>
        )}
      </div>
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex">
          {missionPct > 0 && (
            <div className="bg-green-500 flex items-center justify-center text-xs font-medium text-white"
              style={{ width: `${missionPct}%` }}>{ratioMetrics.mission}</div>
          )}
          {buildersPct > 0 && (
            <div className="bg-blue-500 flex items-center justify-center text-xs font-medium text-white"
              style={{ width: `${buildersPct}%` }}>{ratioMetrics.builders_log}</div>
          )}
          {productPct > 0 && (
            <div className="bg-orange-500 flex items-center justify-center text-xs font-medium text-white"
              style={{ width: `${productPct}%` }}>{ratioMetrics.product}</div>
          )}
        </div>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-gray-700 dark:text-gray-300">Mission: {ratioMetrics.mission}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-gray-700 dark:text-gray-300">Builder&apos;s Log: {ratioMetrics.builders_log}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded" />
            <span className="text-gray-700 dark:text-gray-300">Product: {ratioMetrics.product}</span>
          </div>
        </div>
        <div className="text-right text-sm text-gray-500 dark:text-gray-500">Current Ratio: {ratioMetrics.ratio}</div>
      </div>
    </div>
  )
}

// ─── Calendar Grid ──────────────────────────────────────────────

function CalendarGrid({
  days, categories, onUpdate, updating
}: {
  days: CalendarDay[]
  categories: ContentCalendar['metadata']['categories']
  onUpdate: (d: string, i: number, u: any) => Promise<void>
  updating: boolean
}) {
  const [expandedCell, setExpandedCell] = useState<string | null>(null)

  const { start, end } = getTwoWeeksRange()
  const visibleDays = days.filter(day => {
    const d = new Date(day.date + 'T12:00:00')
    return d >= start && d <= end
  })

  // Parse expanded cell
  let expandedDayDate: string | null = null
  let expandedItemIdx = -1
  if (expandedCell) {
    const sep = expandedCell.lastIndexOf('|')
    expandedDayDate = expandedCell.slice(0, sep)
    expandedItemIdx = parseInt(expandedCell.slice(sep + 1))
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Content Calendar</h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 text-gray-700 dark:text-gray-300 font-medium w-32">Day</th>
              {CONTENT_TYPES.map(type => (
                <th key={type} className="text-center py-3 px-1 text-gray-700 dark:text-gray-300 font-medium min-w-[140px]">
                  <div className="flex flex-col items-center gap-1">
                    <span>{TYPE_CONFIG[type].icon}</span>
                    <span className="text-xs">{TYPE_CONFIG[type].shortLabel}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleDays.map(day => {
              const expandedItem = expandedDayDate === day.date && expandedItemIdx >= 0
                ? day.items[expandedItemIdx]
                : null

              return (
                <Fragment key={day.date}>
                  <tr className={`border-b border-gray-100 dark:border-gray-800/50 ${isToday(day.date) ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}>
                    {/* Day label */}
                    <td className="py-3 px-2 align-top">
                      <div className={`text-sm font-medium ${isToday(day.date) ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-gray-100'}`}>
                        {formatDate(day.date)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{DAY_TYPE_LABELS[day.dayType]}</div>
                    </td>

                    {/* Content type columns */}
                    {CONTENT_TYPES.map(type => {
                      const itemIdx = day.items.findIndex(i => i.type === type)
                      const item = itemIdx >= 0 ? day.items[itemIdx] : null
                      const cellKey = `${day.date}|${itemIdx}`
                      const isActive = expandedCell === cellKey

                      return (
                        <td key={type} className="py-2 px-1 align-top">
                          {item ? (
                            <button
                              onClick={() => setExpandedCell(isActive ? null : cellKey)}
                              className={`w-full p-2 rounded-lg border text-left transition-colors ${
                                isActive
                                  ? 'border-amber-500/60 bg-amber-50 dark:bg-gray-800'
                                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                              }`}
                            >
                              <div className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                                {item.title}
                              </div>
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded text-white font-medium"
                                  style={{ backgroundColor: categories[item.category]?.color || '#6b7280' }}
                                >
                                  {item.category === 'builders_log' ? 'Builder' : item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                </span>
                                <StatusBadge status={item.status} />
                              </div>
                              {item.draftText && (
                                <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-600">
                                  {getTextStats(item.draftText).words}w
                                </div>
                              )}
                            </button>
                          ) : (
                            <div className="min-h-[60px] flex items-center justify-center">
                              <span className="text-xs text-gray-400 dark:text-gray-700">&mdash;</span>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>

                  {/* Expanded panel row */}
                  {expandedItem && expandedDayDate === day.date && (
                    <tr>
                      <td colSpan={CONTENT_TYPES.length + 1} className="p-0">
                        <ExpandedItemPanel
                          item={expandedItem}
                          dayDate={day.date}
                          itemIndex={expandedItemIdx}
                          onUpdate={onUpdate}
                          updating={updating}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {visibleDays.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-500">No calendar data available</div>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────

export default function ContentStudioPage() {
  const [calendar, setCalendar] = useState<ContentCalendar | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  async function fetchCalendar() {
    try {
      const res = await fetch('/api/content-calendar')
      if (!res.ok) throw new Error('Failed to fetch content calendar')
      setCalendar(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCalendar() }, [])

  async function handleUpdate(dayDate: string, itemIndex: number, update: any) {
    setUpdating(true)
    try {
      const res = await fetch('/api/content-calendar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayDate, itemIndex, update })
      })
      if (!res.ok) throw new Error('Update failed')
      // Refresh data
      const fresh = await fetch('/api/content-calendar')
      if (fresh.ok) setCalendar(await fresh.json())
    } catch (err) {
      console.error('Update error:', err)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-950">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  if (!calendar) {
    return (
      <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-950">
        <div className="text-center py-20 text-gray-500 dark:text-gray-500">No calendar data</div>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const todaysDay = calendar.days.find(d => d.date === today)

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Content Studio</h1>
        <p className="text-gray-600 dark:text-gray-400">Content planning, review, and approval workflow</p>
      </div>

      <TodaysPostsQueue todaysDay={todaysDay} onUpdate={handleUpdate} updating={updating} />
      <RatioMeter ratioMetrics={calendar.ratioMetrics} categories={calendar.metadata.categories} />
      <CalendarGrid days={calendar.days} categories={calendar.metadata.categories}
        onUpdate={handleUpdate} updating={updating} />
    </div>
  )
}
