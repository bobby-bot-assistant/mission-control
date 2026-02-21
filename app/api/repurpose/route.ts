import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { readJSON, writeJSON } from '@/lib/data'

async function readSocialPosts() {
  return readJSON<{ posts: any[], postingGuidelines?: any }>('social-posts.json')
}

async function writeSocialPosts(data: any) {
  return writeJSON('social-posts.json', data)
}

async function readLog() {
  return readJSON<any[]>('repurpose-log.json')
}

async function writeLog(data: any) {
  return writeJSON('repurpose-log.json', data)
}

// Generate content variants from approved content
function generateVariants(approval: { id: string; title: string; content: string; type: string }) {
  const content = approval.content
  const title = approval.title

  // Extract key points (first 3 sentences or paragraphs)
  const sentences = content.split(/[.!?]\s+/).filter(s => s.trim().length > 20)
  const keyPoints = sentences.slice(0, 5).join('. ')
  const hookLine = sentences[0] || title

  const variants = []
  const ts = Date.now()

  // 1. LinkedIn (long-form thought leadership)
  variants.push({
    id: `post-${ts}-linkedin`,
    type: 'social-post',
    title: `[LinkedIn] ${title}`,
    platform: 'LinkedIn',
    target_audience: 'Health tech leaders, child development researchers, ethical AI practitioners',
    goal: 'Thought leadership positioning',
    content: formatLinkedIn(title, content),
    hashtags: '#EthicalAI #ChildDevelopment #MentalHealth #HealthTech #MindfulMedia',
    status: 'draft',
    notes: `Auto-generated from approved: "${title}". Review and personalize before posting.`,
    variant: 'linkedin',
    sourceApprovalId: approval.id,
    queueOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })

  // 2. X/Twitter (punchy, hook-driven)
  variants.push({
    id: `post-${ts}-x`,
    type: 'social-post',
    title: `[X] ${title}`,
    platform: 'X',
    target_audience: 'Tech/health intersection, parents, policy makers',
    goal: 'Engagement and reach',
    content: formatTwitter(hookLine, keyPoints),
    hashtags: '#EthicalAI #ChildHealth',
    status: 'draft',
    notes: `Auto-generated from approved: "${title}". Keep under 280 chars or use thread format.`,
    variant: 'x-twitter',
    sourceApprovalId: approval.id,
    queueOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })

  // 3. Video script (30-60 sec hook)
  variants.push({
    id: `post-${ts}-video`,
    type: 'social-post',
    title: `[Video Script] ${title}`,
    platform: 'TikTok/Reels',
    target_audience: 'Parents, educators, health-conscious tech users',
    goal: '30-60 second hook video',
    content: formatVideoScript(title, hookLine, keyPoints),
    status: 'draft',
    notes: `Auto-generated from approved: "${title}". Record talking-head style. First 3 seconds = hook.`,
    variant: 'video-script',
    sourceApprovalId: approval.id,
    queueOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })

  // 4. Blog draft (if substantial — content > 500 chars)
  if (content.length > 500) {
    variants.push({
      id: `post-${ts}-blog`,
      type: 'social-post',
      title: `[Blog Draft] ${title}`,
      platform: 'Blog',
      target_audience: 'SEO, long-form readers, researchers',
      goal: 'Authority building, SEO value',
      content: formatBlogDraft(title, content),
      status: 'draft',
      notes: `Auto-generated from approved: "${title}". Expand with citations and examples before publishing.`,
      variant: 'blog-draft',
      sourceApprovalId: approval.id,
      queueOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  return variants
}

function formatLinkedIn(title: string, content: string): string {
  const paragraphs = content.split('\n').filter(p => p.trim())
  const hook = paragraphs[0] || title
  const body = paragraphs.slice(1, 6).join('\n\n')
  return `${hook}\n\n${body}\n\n---\n\nPushing the boundaries of ethical AI at the intersection of healthcare and entertainment.\n\nWhat's your take? 👇`
}

function formatTwitter(hook: string, keyPoints: string): string {
  // Create a punchy thread starter
  const shortHook = hook.length > 200 ? hook.substring(0, 200) + '...' : hook
  return `${shortHook}\n\n🧵 Thread:\n\n1/ ${keyPoints.substring(0, 250)}...\n\n[Continue thread with key insights from the full piece]`
}

function formatVideoScript(title: string, hook: string, keyPoints: string): string {
  return `🎬 VIDEO SCRIPT: ${title}
⏱ Target: 30-60 seconds

[HOOK — First 3 seconds]
"${hook.substring(0, 100)}..."

[BODY — 20-40 seconds]
Key points to hit:
${keyPoints.split('. ').slice(0, 3).map((p, i) => `${i + 1}. ${p.trim()}`).join('\n')}

[CTA — Last 5-10 seconds]
"If this resonates, follow for more on ethical AI in children's media. Link in bio."

[PRODUCTION NOTES]
- Talking head, eye contact
- B-roll: kids using tablets, family moments
- Text overlay for key stats
- Firelight warm color grade`
}

function formatBlogDraft(title: string, content: string): string {
  return `# ${title}

*Draft — auto-generated from approved content. Expand before publishing.*

${content}

---

## Key Takeaways

[Extract 3-5 bullet points]

## What This Means for Families

[Add practical implications]

## Further Reading

[Add relevant links and citations]

---

*Bobby Alexis is the founder of Mindful Media, pushing the boundaries of ethical AI at the intersection of healthcare and entertainment.*`
}

// POST: Trigger repurpose for an approval
export async function POST(req: NextRequest) {
  const { approvalId, title, content, type } = await req.json()

  if (!approvalId || !content) {
    return NextResponse.json({ error: 'approvalId and content required' }, { status: 400 })
  }

  // Generate variants
  const variants = generateVariants({ id: approvalId, title: title || 'Untitled', content, type: type || 'content-draft' })

  // Add to social posts
  const data = await readSocialPosts()
  if (!data.posts) data.posts = []
  const maxOrder = data.posts.reduce((max: number, p: any) => Math.max(max, p.queueOrder || 0), 0)
  variants.forEach((v, i) => { v.queueOrder = maxOrder + i + 1 })
  data.posts.push(...variants)
  await writeSocialPosts(data)

  // Log the repurpose event
  const log = await readLog()
  log.push({
    approvalId,
    title,
    variantCount: variants.length,
    variantIds: variants.map(v => v.id),
    timestamp: new Date().toISOString()
  })
  await writeLog(log)

  return NextResponse.json({
    success: true,
    message: `Generated ${variants.length} content variants`,
    variants: variants.map(v => ({ id: v.id, platform: v.platform, variant: v.variant }))
  })
}

// GET: View repurpose log
export async function GET() {
  return NextResponse.json(readLog())
}
