// Mission Control Backfill Script
// Populates real Projects, Memories, and Decisions from Phase 1-7

const DB_PATH = './data/mission-control.db'
const Database = require('better-sqlite3')
const db = new Database(DB_PATH)
db.pragma('foreign_keys = ON')

// Phase 1-7 Projects
const projects = [
  {
    id: 'proj_phase1',
    name: 'Mission Control Phase 1',
    codename: 'FOUNDATION',
    vision: 'Next.js scaffold + Tailwind + SQLite schema + Projects CRUD',
    status: '✅ Completed',
    priority: '🔴 Critical',
    category: 'Business',
    started: '2026-02-04',
    target_eta: '2026-02-04',
    tags: ['system', 'foundation', 'phase1']
  },
  {
    id: 'proj_phase2',
    name: 'Mission Control Phase 2',
    codename: 'PROJECTS_UI',
    vision: 'Projects UI + Memory Vault + Activity Feed',
    status: '✅ Completed',
    priority: '🔴 Critical',
    category: 'Business',
    started: '2026-02-04',
    target_eta: '2026-02-05',
    tags: ['system', 'phase2']
  },
  {
    id: 'proj_phase3',
    name: 'Mission Control Phase 3',
    codename: 'PEOPLE_TASKS',
    vision: 'People CRM + Tasks Command Center + Enhanced Activity Feed',
    status: '✅ Completed',
    priority: '🔴 Critical',
    category: 'Business',
    started: '2026-02-05',
    target_eta: '2026-02-05',
    tags: ['system', 'phase3']
  },
  {
    id: 'proj_phase4',
    name: 'Mission Control Phase 4',
    codename: 'DOCUMENTS',
    vision: 'Documents Library with CRUD, search, markdown render, project linking',
    status: '✅ Completed',
    priority: '🔴 Critical',
    category: 'Business',
    started: '2026-02-05',
    target_eta: '2026-02-05',
    tags: ['system', 'phase4']
  },
  {
    id: 'proj_phase6',
    name: 'Phase 6 - Autonomous Operating System',
    codename: 'AUTONOMY',
    vision: 'SDS as core operating system, decision pipelines, nightly autonomous loop',
    status: '✅ Completed',
    priority: '🔴 Critical',
    category: 'Business',
    started: '2026-02-05',
    target_eta: '2026-02-05',
    tags: ['system', 'autonomy', 'phase6']
  },
  {
    id: 'proj_phase7',
    name: 'Phase 7 - Input & Leverage Activation',
    codename: 'INPUT_ACTIVATION',
    vision: 'Brave Search intake, opportunity scoring, content pipeline activation',
    status: '✅ Completed',
    priority: '🔴 Critical',
    category: 'Business',
    started: '2026-02-05',
    target_eta: '2026-02-05',
    tags: ['system', 'phase7', 'input']
  },
  {
    id: 'proj_exec_home',
    name: 'Executive Home Screen',
    codename: 'EXEC_HOME',
    vision: 'At-a-glance leverage visibility, SDS ranking, decision dashboard',
    status: '🏗 In Development',
    priority: '🔴 Critical',
    category: 'Business',
    started: '2026-02-05',
    target_eta: '2026-02-06',
    tags: ['system', 'executive', 'ui']
  },
  {
    id: 'proj_story_hour',
    name: 'Story Hour with Simon',
    codename: 'STORY_HOUR',
    vision: 'AI-personalized bedtime interventions, NIH SBIR anchor project',
    status: '🔬 Research & Discovery',
    priority: '🔴 Critical',
    category: 'Business',
    started: '2026-02-05',
    target_eta: '2026-04-05',
    tags: ['product', 'nih-sbir', 'priority']
  },
  {
    id: 'proj_grant_engine',
    name: 'Grant Revenue Engine',
    codename: 'GRANT_ENGINE',
    vision: 'Systematic grant pipeline from discovery to submission',
    status: '🎯 Up Next (queued for soon)',
    priority: '🔴 Critical',
    category: 'Business',
    started: '2026-02-05',
    target_eta: '2026-06-01',
    tags: ['revenue', 'grants', 'priority']
  },
  {
    id: 'proj_content_engine',
    name: 'Content & Authority Engine',
    codename: 'CONTENT_ENGINE',
    vision: 'Content-to-leverage pipeline for compounding authority',
    status: '🎯 Up Next (queued for soon)',
    priority: '🟠 High',
    category: 'Business',
    started: '2026-02-05',
    target_eta: '2026-06-01',
    tags: ['content', 'authority', 'priority']
  }
]

// Memories - Key decisions and context
const memories = [
  {
    id: 'mem_state_lock',
    title: 'STATE.md context lock created',
    category: '🎯 Decision Made (and reasoning)',
    content: 'Created STATE.md as binding context lock that overrides all older threads. Explicitly deprioritized NIH, SAM, GrantScout until reactivated. Critical for maintaining focus.',
    why_it_matters: 'Prevents drift to older priorities during stabilization phase.',
    memory_date: '2026-02-04',
    source: 'System architecture decision',
    tags: ['context', 'state', 'priority', 'governance']
  },
  {
    id: 'mem_sds_created',
    title: 'SDS (Strategic Decision Score) created',
    category: '🏆 Win / Achievement',
    content: 'Created Strategic Decision Engine formula: SDS = (Revenue×2) + (Alignment×2) + (Leverage×1.5) + (TimeFit×1) - (CognitiveLoad×1). Thresholds: YES≥25, PROBABLY 18-24, LATER 12-17, NO<12.',
    why_it_matters: 'Enables autonomous prioritization without asking.',
    memory_date: '2026-02-05',
    source: 'Phase 6 - Autonomy System',
    tags: ['system', 'decision', 'autonomy', 'priority']
  },
  {
    id: 'mem_phase7_input',
    title: 'Phase 7 Input Activation - Grant Opportunities',
    category: '📚 Learning / Insight',
    content: 'Ingested 26 inputs via Brave Search: 11 grant opportunities (NIH, NIMH, SAMHSA, Blank, Cigna), 10 AI+mental health research signals, 5 family media trends. Key insight: NIH SBIR reauthorization pending creates timeline risk. SDS scoring complete: 6 YES, 2 LATER.',
    why_it_matters: 'Populates opportunity pipeline for Q1-Q2 2026.',
    memory_date: '2026-02-05',
    source: 'Brave Search research',
    tags: ['research', 'grants', 'input', 'phase7']
  },
  {
    id: 'mem_story_hour_anchor',
    title: 'Story Hour identified as NIH SBIR anchor',
    category: '🎯 Decision Made (and reasoning)',
    content: 'Story Hour with Simon positioned as anchor for NIH SBIR application. Core argument: preventive mental health through AI-personalized bedtime interventions. SDS=32.5, highest priority.',
    why_it_matters: 'Focuses all resources on highest-leverage opportunity.',
    memory_date: '2026-02-05',
    source: 'Strategic analysis',
    tags: ['product', 'nih-sbir', 'priority', 'story-hour']
  },
  {
    id: 'mem_exec_home_design',
    title: 'Executive Home Screen design finalized',
    category: '🏆 Win / Achievement',
    content: 'Created Executive Home Screen design with: Leverage Opportunities (SDS-ranked), Decisions Needed, Recent Activity, Projects Overview, Money/Authority/Optionality dashboard.',
    why_it_matters: 'Enables Bobby to see priorities at a glance.',
    memory_date: '2026-02-05',
    source: 'Phase 7+ refinement',
    tags: ['system', 'ui', 'executive', 'design']
  },
  {
    id: 'mem_memory_backfill',
    title: 'Memory backfill - Foundational context',
    category: '📚 Learning / Insight',
    content: 'Backfilled key memories explaining system evolution: System Stabilization decision, Mission Control as source of truth, SDS as operating system, Content as leverage, Story Hour pivot.',
    why_it_matters: 'Provides continuity and coherent system story.',
    memory_date: '2026-02-05',
    source: 'System documentation',
    tags: ['memory', 'context', 'system', 'history']
  }
]

// Tasks - Critical action items
const tasks = [
  {
    id: 'task_nih_sbir',
    title: 'Complete NIH SBIR Phase I Application',
    description: 'Using NIH_SBIR_Framework.md as foundation. Priority: HIGH. Deadline: April 5, 2026. SDS=32.5.',
    status: '🔄 In Progress (actively working)',
    priority: '🔴 Critical',
    due_date: '2026-04-05',
    notes: ['GrantScout opportunity #1', 'Phase I = $300K, Phase II = $2M'],
    subtasks: []
  },
  {
    id: 'task_story_hour_mvp',
    title: 'Define Story Hour MVP scope',
    description: 'Document what needs to be built (3 episodes, Simon design), researched (clinical validation), and framed (hypotheses, market analysis).',
    status: '👀 Review / Waiting (blocked or needs input)',
    priority: '🔴 Critical',
    due_date: '2026-02-06',
    notes: ['Requires Bobby input on production budget'],
    subtasks: []
  },
  {
    id: 'task_exec_home_link',
    title: 'Connect Executive Home to real API data',
    description: 'Current Executive Home uses mock data. Link to real /api/projects, /api/tasks, /api/memories endpoints.',
    status: '📥 Backlog (captured but not started)',
    priority: '🟠 High',
    due_date: '2026-02-07',
    notes: ['Technical implementation needed'],
    subtasks: []
  },
  {
    id: 'task_backfill_projects',
    title: 'Backfill Mission Control with real Projects',
    description: 'Create real Project entries for all phases (1-7) via API. Currently only one project exists.',
    status: '📥 Backlog (captured but not started)',
    priority: '🟠 High',
    due_date: '2026-02-06',
    notes: ['API may have issues, manual entry may be needed'],
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

// Run inserts
console.log('=== Backfilling Mission Control ===\n')

console.log('--- Projects ---')
projects.forEach(p => insertOrSkip('projects', {
  name: p.name,
  codename: p.codename,
  vision: p.vision,
  status: p.status,
  priority: p.priority,
  category: p.category,
  started: p.started,
  target_eta: p.target_eta,
  last_active: new Date().toISOString(),
  tags: JSON.stringify(p.tags)
}, p.id))

console.log('\n--- Memories ---')
memories.forEach(m => insertOrSkip('memories', {
  title: m.title,
  category: m.category,
  content: m.content,
  why_it_matters: m.why_it_matters,
  memory_date: m.memory_date,
  source: m.source,
  tags: JSON.stringify(m.tags)
}, m.id))

console.log('\n--- Tasks ---')
tasks.forEach(t => insertOrSkip('tasks', {
  title: t.title,
  description: t.description,
  status: t.status,
  priority: t.priority,
  due_date: t.due_date,
  notes: JSON.stringify(t.notes),
  subtasks: JSON.stringify(t.subtasks)
}, t.id))

console.log('\n=== Backfill Complete ===')
console.log(`Projects: ${projects.length}`)
console.log(`Memories: ${memories.length}`)
console.log(`Tasks: ${tasks.length}`)