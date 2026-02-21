#!/usr/bin/env node
const fs = require('fs')

const DATA_DIR = '/Users/daisydukes/openclaw-projects/mission-control-data'
const calendar = JSON.parse(fs.readFileSync(`${DATA_DIR}/content-calendar.json`, 'utf-8'))
const { posts } = JSON.parse(fs.readFileSync(`${DATA_DIR}/social-posts.json`, 'utf-8'))

// Build lookups
const postsById = {}
const postsByDate = {}
for (const post of posts) {
  postsById[post.id] = post
  if (!postsByDate[post.scheduledDate]) postsByDate[post.scheduledDate] = []
  postsByDate[post.scheduledDate].push(post)
}

// Helper: get best X content (prefer root-level x, then platforms.x)
function getXContent(post) {
  const src = post.x || post.platforms?.x
  if (!src) return { content: '', tweets: [] }
  return { content: src.content || '', tweets: src.additionalTweets || [] }
}

// Migrate old status values to new workflow
function migrateStatus(oldStatus) {
  if (oldStatus === 'not_started') return 'draft'
  if (oldStatus === 'reviewed') return 'approved'
  if (oldStatus === 'posted') return 'sent'
  if (oldStatus === 'ready') return 'approved'
  return oldStatus || 'draft'
}

// Populate item content from a social post based on item type
function populateFromPost(item, post) {
  if (['linkedin_article', 'linkedin_native', 'blog'].includes(item.type)) {
    if (!item.draftText && post.platforms?.linkedin?.content) {
      item.draftText = post.platforms.linkedin.content
    }
  }
  if (item.type === 'x_thread') {
    const x = getXContent(post)
    if (!item.draftText && x.content) item.draftText = x.content
    if ((!item.tweets || item.tweets.length === 0) && x.tweets.length > 0) item.tweets = x.tweets
  }
}

// Create new items from a social post
function createItemsFromPost(post) {
  const items = []
  if (post.platforms?.linkedin?.content) {
    items.push({
      type: 'linkedin_article',
      title: post.title,
      category: 'mission',
      status: migrateStatus(post.platforms.linkedin.status || 'draft'),
      owner: 'kobe',
      draftText: post.platforms.linkedin.content,
      tweets: [],
      feedbackHistory: [],
      approvedAt: null,
      sentAt: null,
      archivedAt: null
    })
  }
  const x = getXContent(post)
  if (x.content) {
    items.push({
      type: 'x_thread',
      title: post.title,
      category: 'mission',
      status: migrateStatus(post.platforms?.x?.status || post.x?.status || 'draft'),
      owner: 'kobe',
      draftText: x.content,
      tweets: x.tweets,
      feedbackHistory: [],
      approvedAt: null,
      sentAt: null,
      archivedAt: null
    })
  }
  return items
}

// --- Step 1: Find sourcePostId links ---
const daySourcePosts = {} // dayDate -> { postId, title }
for (const day of calendar.days) {
  for (const item of day.items) {
    if (item.sourcePostId) {
      daySourcePosts[day.date] = { postId: item.sourcePostId, title: item.title }
    }
  }
}

// Track which post IDs have been used
const usedPostIds = new Set()

// --- Step 2: Process existing calendar items ---
for (const day of calendar.days) {
  const srcRef = daySourcePosts[day.date]
  const srcPost = srcRef ? postsById[srcRef.postId] : null
  if (srcPost) usedPostIds.add(srcRef.postId)

  for (const item of day.items) {
    // Add new fields
    item.feedbackHistory = item.feedbackHistory || []
    item.approvedAt = item.approvedAt || null
    item.sentAt = item.sentAt || null
    item.archivedAt = item.archivedAt || null
    item.draftText = item.draftText || ''
    item.tweets = item.tweets || []
    item.status = migrateStatus(item.status)

    // Remove legacy sourcePostId field
    delete item.sourcePostId
    // Remove legacy note field (will be in feedbackHistory)
    if (item.note) {
      item.feedbackHistory.push({
        id: `fb-migrated-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        author: 'system',
        note: item.note,
        timestamp: new Date().toISOString(),
        action: 'note'
      })
      delete item.note
    }

    // Populate from source post if same title group
    if (srcPost && item.title === srcRef.title) {
      populateFromPost(item, srcPost)
    }
  }
}

// --- Step 3: Add remaining social posts ---
for (const post of posts) {
  if (usedPostIds.has(post.id)) continue

  const existingDay = calendar.days.find(d => d.date === post.scheduledDate)
  const newItems = createItemsFromPost(post)

  if (existingDay) {
    // Add items that don't conflict with existing types+titles
    for (const newItem of newItems) {
      const hasConflict = existingDay.items.some(
        ei => ei.type === newItem.type && ei.title === newItem.title
      )
      if (!hasConflict) {
        existingDay.items.push(newItem)
      }
    }
  } else if (newItems.length > 0) {
    const d = new Date(post.scheduledDate + 'T12:00:00')
    const dow = d.getDay()
    const dayTypes = ['weekend', 'anchor', 'engagement', 'engagement', 'standalone', 'video', 'weekend']
    calendar.days.push({
      date: post.scheduledDate,
      dayType: dayTypes[dow],
      label: post.title,
      items: newItems
    })
  }
}

// --- Step 4: Sort days by date ---
calendar.days.sort((a, b) => a.date.localeCompare(b.date))

// --- Step 5: Recalculate ratio metrics ---
let mission = 0, builders_log = 0, product = 0
for (const day of calendar.days) {
  for (const item of day.items) {
    if (item.category === 'mission') mission++
    else if (item.category === 'builders_log') builders_log++
    else if (item.category === 'product') product++
  }
}
calendar.ratioMetrics = {
  ...calendar.ratioMetrics,
  mission,
  builders_log,
  product,
  total: mission + builders_log + product,
  ratio: `${mission}:${product}`
}

// --- Write ---
fs.writeFileSync(`${DATA_DIR}/content-calendar.json`, JSON.stringify(calendar, null, 2))
const totalItems = calendar.days.reduce((s, d) => s + d.items.length, 0)
console.log(`Migration complete: ${calendar.days.length} days, ${totalItems} items`)
console.log(`Ratio: mission=${mission} builders_log=${builders_log} product=${product}`)
