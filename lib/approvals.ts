import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'mission-control.json')

function loadDb() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
}

function saveDb(db: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
}

export interface Approval {
  id: string
  title: string
  type: 'email-draft' | 'content-draft' | 'proposal' | 'scout-alert' | 'other'
  status: 'pending' | 'approved' | 'rejected' | 'revised'
  content: string
  notes?: string
  linked_contact_id?: string
  linked_project_id?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

export function getAllApprovals(): Approval[] {
  const db = loadDb()
  return (db.approvals || []).sort((a: Approval, b: Approval) => b.created_at.localeCompare(a.created_at))
}

export function createApproval(approval: Omit<Approval, 'id' | 'created_at' | 'updated_at'>): Approval {
  const db = loadDb()
  if (!db.approvals) db.approvals = []
  const now = new Date().toISOString()
  const newApproval: Approval = {
    ...approval,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now
  }
  db.approvals.push(newApproval)
  saveDb(db)
  return newApproval
}

export function updateApproval(id: string, updates: Partial<Approval>): Approval | null {
  const db = loadDb()
  const idx = (db.approvals || []).findIndex((a: Approval) => a.id === id)
  if (idx < 0) return null
  const now = new Date().toISOString()
  db.approvals[idx] = { ...db.approvals[idx], ...updates, updated_at: now }
  if (updates.status === 'approved' || updates.status === 'rejected') {
    db.approvals[idx].resolved_at = now
  }
  saveDb(db)

  // Auto-trigger repurpose pipeline on approval of content
  if (updates.status === 'approved') {
    const approval = db.approvals[idx]
    triggerRepurpose(approval).catch(console.error)
  }

  return db.approvals[idx]
}

async function triggerRepurpose(approval: Approval) {
  try {
    // Call the repurpose API internally via file-based approach
    const socialPostsPath = path.join(process.cwd(), '..', 'mission-control-data', 'social-posts.json')
    const repurposeLogPath = path.join(process.cwd(), '..', 'mission-control-data', 'repurpose-log.json')

    // Read current posts
    let socialData: any
    try { socialData = JSON.parse(fs.readFileSync(socialPostsPath, 'utf8')) }
    catch { socialData = { posts: [], postingGuidelines: {} } }

    if (!socialData.posts) socialData.posts = []
    const maxOrder = socialData.posts.reduce((max: number, p: any) => Math.max(max, p.queueOrder || 0), 0)
    const ts = Date.now()
    const content = approval.content
    const title = approval.title
    const sentences = content.split(/[.!?]\s+/).filter((s: string) => s.trim().length > 20)
    const keyPoints = sentences.slice(0, 5).join('. ')
    const hookLine = sentences[0] || title

    const variants: any[] = []

    // LinkedIn
    const linkedInBody = content.split('\n').filter((p: string) => p.trim()).slice(0, 6).join('\n\n')
    variants.push({
      id: `post-${ts}-linkedin`,
      type: 'social-post',
      title: `[LinkedIn] ${title}`,
      platform: 'LinkedIn',
      target_audience: 'Health tech leaders, child development researchers, ethical AI practitioners',
      goal: 'Thought leadership positioning',
      content: `${linkedInBody}\n\n---\n\nPushing the boundaries of ethical AI at the intersection of healthcare and entertainment.\n\nWhat's your take? 👇`,
      hashtags: '#EthicalAI #ChildDevelopment #MentalHealth #HealthTech #MindfulMedia',
      status: 'draft',
      notes: `Auto-generated from approved: "${title}". Review and personalize before posting.`,
      variant: 'linkedin',
      sourceApprovalId: approval.id,
      queueOrder: maxOrder + 1
    })

    // X/Twitter
    const shortHook = hookLine.length > 200 ? hookLine.substring(0, 200) + '...' : hookLine
    variants.push({
      id: `post-${ts}-x`,
      type: 'social-post',
      title: `[X] ${title}`,
      platform: 'X',
      target_audience: 'Tech/health intersection, parents, policy makers',
      goal: 'Engagement and reach',
      content: `${shortHook}\n\n🧵 Thread:\n\n1/ ${keyPoints.substring(0, 250)}...\n\n[Continue thread with key insights]`,
      hashtags: '#EthicalAI #ChildHealth',
      status: 'draft',
      notes: `Auto-generated from approved: "${title}".`,
      variant: 'x-twitter',
      sourceApprovalId: approval.id,
      queueOrder: maxOrder + 2
    })

    // Video script
    variants.push({
      id: `post-${ts}-video`,
      type: 'social-post',
      title: `[Video Script] ${title}`,
      platform: 'TikTok/Reels',
      target_audience: 'Parents, educators, health-conscious tech users',
      goal: '30-60 second hook video',
      content: `🎬 VIDEO SCRIPT: ${title}\n⏱ Target: 30-60 seconds\n\n[HOOK — First 3 seconds]\n"${hookLine.substring(0, 100)}..."\n\n[BODY]\n${keyPoints.split('. ').slice(0, 3).map((p: string, i: number) => `${i + 1}. ${p.trim()}`).join('\n')}\n\n[CTA]\n"Follow for more on ethical AI in children's media."`,
      status: 'draft',
      notes: `Auto-generated from approved: "${title}".`,
      variant: 'video-script',
      sourceApprovalId: approval.id,
      queueOrder: maxOrder + 3
    })

    // Blog draft (only if substantial)
    if (content.length > 500) {
      variants.push({
        id: `post-${ts}-blog`,
        type: 'social-post',
        title: `[Blog Draft] ${title}`,
        platform: 'Blog',
        target_audience: 'SEO, long-form readers, researchers',
        goal: 'Authority building, SEO value',
        content: `# ${title}\n\n*Draft — expand before publishing.*\n\n${content}\n\n---\n\n*Bobby Alexis is the founder of Mindful Media, pushing the boundaries of ethical AI at the intersection of healthcare and entertainment.*`,
        status: 'draft',
        notes: `Auto-generated from approved: "${title}".`,
        variant: 'blog-draft',
        sourceApprovalId: approval.id,
        queueOrder: maxOrder + 4
      })
    }

    // Add timestamps
    const now = new Date().toISOString()
    variants.forEach(v => { v.createdAt = now; v.updatedAt = now })

    // Save
    socialData.posts.push(...variants)
    fs.writeFileSync(socialPostsPath, JSON.stringify(socialData, null, 2))

    // Log
    let log: any[]
    try { log = JSON.parse(fs.readFileSync(repurposeLogPath, 'utf8')) }
    catch { log = [] }
    log.push({
      approvalId: approval.id,
      title,
      variantCount: variants.length,
      variantIds: variants.map(v => v.id),
      timestamp: now
    })
    fs.writeFileSync(repurposeLogPath, JSON.stringify(log, null, 2))

    console.log(`[Repurpose] Generated ${variants.length} variants for "${title}"`)
  } catch (err) {
    console.error('[Repurpose] Failed:', err)
  }
}

export function deleteApproval(id: string): boolean {
  const db = loadDb()
  const before = (db.approvals || []).length
  db.approvals = (db.approvals || []).filter((a: Approval) => a.id !== id)
  saveDb(db)
  return db.approvals.length < before
}
