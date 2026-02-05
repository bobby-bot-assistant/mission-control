import { getDb } from './db'
import { Project, Memory } from './types'

function seedDatabase() {
  const db = getDb()

  // Check if data already exists
  const existingProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }
  if (existingProjects.count > 0) {
    console.log('Database already has data, skipping seed.')
    return
  }

  console.log('Seeding database with initial data...')

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
    new Date().toISOString(),
    JSON.stringify(['system', 'infrastructure', 'priority'])
  )

  // 2. Memory: STATE.md creation
  const memory1Id = crypto.randomUUID()
  db.prepare(`
    INSERT INTO memories (id, title, category, content, why_it_matters, memory_date, source, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    memory1Id,
    'STATE.md context lock created',
    '🎯 Decision Made (and reasoning)',
    'Created STATE.md as binding context lock that overrides all older threads. Explicitly deprioritized NIH, SAM, GrantScout until reactivated. This prevents confusion between active stabilization work and paused business initiatives.',
    'Critical for maintaining focus on current phase without drift to older priorities.',
    '2026-02-04',
    'Telegram conversation with Bobby',
    JSON.stringify(['context', 'state', 'priority', 'governance'])
  )

  // 3. Memory: Phase 0 decisions
  const memory2Id = crypto.randomUUID()
  db.prepare(`
    INSERT INTO memories (id, title, category, content, why_it_matters, memory_date, source, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    memory2Id,
    'Phase 0 architecture decisions',
    '📚 Learning / Insight',
    'Key decisions: Mission Control is separate app (not merged with 2nd Brain), no automated sync in Phase 1, all schemas created up front, Telegram for weekly digest delivery, update cadence is after meaningful sessions not real-time.',
    'Establishes clear boundaries for the project scope and prevents feature creep.',
    '2026-02-04',
    'Architecture note in /daisy/core/',
    JSON.stringify(['architecture', 'decisions', 'phase0'])
  )

  // 4. Memory: Auth/routing hardening
  const memory3Id = crypto.randomUUID()
  db.prepare(`
    INSERT INTO memories (id, title, category, content, why_it_matters, memory_date, source, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    memory3Id,
    'Auth and routing layer locked',
    '🏆 Win / Achievement',
    'Completed Phase B of OpenClaw stabilization: OpenRouter API key configured for MiniMax M2.1 routing, OpenAI API key for Codex escalation, Brave Search integration working. All models verified with test calls.',
    'Foundation is solid - can now proceed with Mission Control development without worrying about auth issues.',
    '2026-02-04',
    'Telegram conversation',
    JSON.stringify(['auth', 'routing', 'infrastructure', 'completed'])
  )

  // 5. Task: Complete Mission Control Phase 1 (referenced from projects table via relationship)
  const taskId = crypto.randomUUID()
  db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, due_date, created_at, updated_at, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    taskId,
    'Complete Mission Control Phase 1 PR',
    'Create PR for Phase 1 foundation work',
    '👀 Review / Waiting (blocked or needs input)',
    '🔴 Critical',
    '2026-02-05',
    new Date().toISOString(),
    new Date().toISOString(),
    JSON.stringify(['Waiting for Bobby review before Phase 2'])
  )

  console.log('✅ Seeded 1 project, 3 memories, 1 task')
  console.log('Project ID:', projectId)
}

seedDatabase()
