// Additional Mission Control entries from 2nd Brain

const DB_PATH = './data/mission-control.db'
const Database = require('./json-db')
const db = new Database(DB_PATH)
db.pragma('foreign_keys = ON')

// Additional memories from 2nd Brain context
const memories = [
  {
    id: 'mem_sam_gov_urgent',
    title: 'SAM.gov Registration URGENT',
    category: '⚠️ Mistake / Lesson Learned',
    content: 'SAM.gov registration required for NIH SBIR eligibility. UEI processing takes 2-6 weeks. This is a BLOCKING risk for April 5 NIH deadline. Must register Mindful Media Network LLC immediately.',
    why_it_matters: 'Without SAM.gov registration, cannot submit NIH SBIR application. Time-sensitive.',
    memory_date: '2026-02-03',
    source: '2nd Brain context',
    tags: ['urgent', 'nih-sbir', 'registration', 'deadline']
  },
  {
    id: 'mem_financial_reality',
    title: 'Running on credit card debt',
    category: '🔑 Key Context (background info)',
    content: 'Mindful Media is currently running on credit card debt. Sustainability is urgent, not optional. Mission without sustainability collapses. Need to ruthlessly prioritize paths that unlock funding or revenue.',
    why_it_matters: 'Every decision must consider financial runway. Revenue/funding is existential.',
    memory_date: '2026-02-03',
    source: 'Bobby disclosure',
    tags: ['financial', 'urgent', 'sustainability', 'revenue']
  },
  {
    id: 'mem_bobby_style',
    title: 'Bobby working style & preferences',
    category: '🔑 Key Context (background info)',
    content: 'Bobby struggles with: Decision fatigue, execution bottlenecks, shiny object syndrome, perfectionism. Works best when: Priorities explicit, tasks broken into concrete steps, someone holds the line. Hours: 8am-12am Pacific. Thinks out loud, values warmth + competence.',
    why_it_matters: 'Understanding working style enables better support and communication.',
    memory_date: '2026-02-03',
    source: 'USER.md documentation',
    tags: ['bobby', 'working-style', 'communication', 'preferences']
  },
  {
    id: 'mem_grantscout_tension',
    title: 'GrantScout MVP tension',
    category: '🎯 Decision Made (and reasoning)',
    content: 'GrantScout has real SaaS revenue potential but risks distracting from NIH SBIR deadline. Decision needed: Go all-in on NIH for 60 days OR controlled parallel build without blowing focus.',
    why_it_matters: 'Major resource allocation decision that affects Q1-Q2 2026 trajectory.',
    memory_date: '2026-02-05',
    source: 'Strategic analysis',
    tags: ['grantscout', 'decision', 'revenue', 'focus']
  }
]

// Additional tasks
const tasks = [
  {
    id: 'task_sam_gov_register',
    title: 'Complete SAM.gov Registration TODAY',
    description: 'Register Mindful Media Network LLC on SAM.gov for NIH SBIR eligibility. UEI processing takes 2-6 weeks. BLOCKING RISK for April 5 deadline.',
    status: '🎯 Up Next (queued for soon)',
    priority: '🔴 Critical',
    due_date: '2026-02-05',
    notes: ['Must be done TODAY', 'UEI needed for NIH submission', 'Processing time 2-6 weeks'],
    subtasks: []
  },
  {
    id: 'task_revenue_decision',
    title: 'Decide: GrantScout parallel build or NIH focus',
    description: 'Make strategic decision on GrantScout MVP. Option A: All-in on NIH for 60 days. Option B: Controlled parallel build without losing NIH focus.',
    status: '👀 Review / Waiting (blocked or needs input)',
    priority: '🔴 Critical',
    due_date: '2026-02-07',
    notes: ['Revenue potential vs focus trade-off', 'Credit card debt pressure', 'NIH deadline April 5'],
    subtasks: []
  }
]

// Helper to insert
function insertOrSkip(table, data, id) {
  const exists = db.prepare(`SELECT COUNT(*) as count FROM ${table} WHERE id = ?`).get(id)
  if (exists.count > 0) {
    console.log(`⏭️  ${id} already exists`)
    return
  }
  
  const columns = Object.keys(data).join(', ')
  const placeholders = Object.keys(data).map(() => '?').join(', ')
  const values = Object.values(data)
  
  db.prepare(`INSERT INTO ${table} (id, ${columns}) VALUES (?, ${placeholders})`).run(id, ...values)
  console.log(`✅ Inserted ${id}`)
}

console.log('=== Adding 2nd Brain Context to Mission Control ===\n')

console.log('--- New Memories ---')
memories.forEach(m => insertOrSkip('memories', {
  title: m.title,
  category: m.category,
  content: m.content,
  why_it_matters: m.why_it_matters,
  memory_date: m.memory_date,
  source: m.source,
  tags: JSON.stringify(m.tags)
}, m.id))

console.log('\n--- New Tasks ---')
tasks.forEach(t => insertOrSkip('tasks', {
  title: t.title,
  description: t.description,
  status: t.status,
  priority: t.priority,
  due_date: t.due_date,
  notes: JSON.stringify(t.notes),
  subtasks: JSON.stringify(t.subtasks)
}, t.id))

console.log('\n=== 2nd Brain Context Added ===')