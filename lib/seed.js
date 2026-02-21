const Database = require('./json-db')
const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, '..', 'data', 'mission-control.db')

function seedDatabase() {
  const db = new Database(DB_PATH)
  db.pragma('foreign_keys = ON')

  // Check if data already exists
  const existingProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get()
  if (existingProjects.count > 0) {
    console.log('Database already has data, skipping seed.')
    db.close()
    return
  }

  console.log('Seeding database with initial data...')

  const now = new Date().toISOString()

  // 1. Project: System Stabilization (current phase)
  const projectId = crypto.randomUUID()
  db.prepare(`
    INSERT INTO projects (id, name, codename, vision, status, priority, category, started, target_eta, last_active, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    projectId,
    'System Stabilization & Autonomy',
    'STABILIZATION',
    'Complete Phase 1 foundation, establish authority rules, create STATE.md context lock',
    '🏗 In Development',
    '🔴 Critical',
    'Business',
    '2026-02-04',
    '2026-02-15',
    now,
    JSON.stringify(['system', 'infrastructure', 'priority'])
  )
  console.log('✓ Created project: System Stabilization')

  // 2. Memory: STATE.md creation
  db.prepare(`
    INSERT INTO memories (id, title, category, content, why_it_matters, memory_date, source, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    'STATE.md context lock created',
    '🎯 Decision Made (and reasoning)',
    'Created STATE.md as binding context lock that overrides all older threads. Explicitly deprioritized NIH, SAM, GrantScout until reactivated.',
    'Critical for maintaining focus on current phase without drift to older priorities.',
    '2026-02-04',
    'Telegram conversation with Bobby',
    JSON.stringify(['context', 'state', 'priority', 'governance'])
  )
  console.log('✓ Created memory: STATE.md context lock')

  // 3. Memory: Phase 0 decisions
  db.prepare(`
    INSERT INTO memories (id, title, category, content, why_it_matters, memory_date, source, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    'Phase 0 architecture decisions',
    '📚 Learning / Insight',
    'Key decisions: Mission Control is separate app (not merged with 2nd Brain), no automated sync in Phase 1, all schemas created up front, Telegram for weekly digest delivery.',
    'Establishes clear boundaries for the project scope.',
    '2026-02-04',
    'Architecture note in /daisy/core/',
    JSON.stringify(['architecture', 'decisions', 'phase0'])
  )
  console.log('✓ Created memory: Phase 0 decisions')

  // 4. Memory: Auth/routing hardening
  db.prepare(`
    INSERT INTO memories (id, title, category, content, why_it_matters, memory_date, source, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    'Auth and routing layer locked',
    '🏆 Win / Achievement',
    'Completed Phase B: OpenRouter API key for MiniMax M2.1, OpenAI API key for Codex escalation, Brave Search integration. All models verified.',
    'Foundation is solid for Mission Control development.',
    '2026-02-04',
    'Telegram conversation',
    JSON.stringify(['auth', 'routing', 'infrastructure', 'completed'])
  )
  console.log('✓ Created memory: Auth/routing hardening')

  // 5. Task: Complete Mission Control Phase 1
  db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, due_date, created_at, updated_at, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    'Complete Mission Control Phase 1 PR',
    'Create PR for Phase 1 foundation work',
    '👀 Review / Waiting (blocked or needs input)',
    '🔴 Critical',
    '2026-02-05',
    now,
    now,
    'Waiting for Bobby review before Phase 2'
  )
  console.log('✓ Created task: Complete Phase 1 PR')

  console.log('\n✅ Seeded 1 project, 3 memories, 1 task')
  db.close()
}

seedDatabase()
