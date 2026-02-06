// Populate Documents Library with all frameworks and key documents

const DB_PATH = './data/mission-control.db'
const Database = require('better-sqlite3')
const db = new Database(DB_PATH)
db.pragma('foreign_keys = ON')

// Documents to add
const documents = [
  {
    id: 'doc_nih_sbir_framework',
    title: 'NIH SBIR Framework',
    filename: 'NIH_SBIR_Framework.md',
    type: 'framework',
    category: 'grants',
    tags: ['nih', 'sbir', 'grants', 'framework'],
    created_by: 'Daisy',
    content: `# NIH SBIR Phase I Application Framework

## Strategic Alignment
Story Hour with Simon as flagship demonstration of Mindful Media's preventive mental health thesis.

## Key Sections
1. Specific Aims (1 page)
2. Research Strategy (6 pages)
3. Commercialization Plan
4. Budget Justification
5. Biosketch

## Timeline
- Specific Aims: Feb 15
- Full Draft: Mar 15
- Submission: Apr 5`
  },
  {
    id: 'doc_story_hour_mvp',
    title: 'Story Hour with Simon MVP',
    filename: 'STORY_HOUR_SIMON.md',
    type: 'product',
    category: 'strategy',
    tags: ['story-hour', 'mvp', 'product', 'nih'],
    created_by: 'Daisy',
    content: `# Story Hour with Simon MVP

## Vision
AI-powered bedtime storytelling system that transforms passive screen time into active parent-child co-regulation.

## MVP Scope
- 3 Complete Episodes (pilot)
- Simon Character Design
- Parent Handoff System™
- Technical Prototype (1 scene)
- Usability Study Protocol (30 families)

## Success Metrics
- Sleep quality improvement signals
- Parent satisfaction ≥ 4/5
- Child engagement maintained
- 80%+ would recommend`
  },
  {
    id: 'doc_decision_engine',
    title: 'Strategic Decision Engine (SDS)',
    filename: 'DECISION_ENGINE.md',
    type: 'framework',
    category: 'operations',
    tags: ['sds', 'decision', 'framework', 'priority'],
    created_by: 'Daisy',
    content: `# Strategic Decision Score (SDS) Framework

## Formula
SDS = (Revenue × 2) + (Alignment × 2) + (Leverage × 1.5) + (TimeFit × 1) - (CognitiveLoad × 1)

## Thresholds
- YES: ≥ 25
- PROBABLY: 18-24
- LATER: 12-17
- NO: < 12

## Implementation
All opportunities scored before decision. Enables autonomous prioritization without asking.`
  },
  {
    id: 'doc_content_leverage',
    title: 'Content Leverage Framework',
    filename: 'CONTENT_LEVERAGE_FRAMEWORK.md',
    type: 'framework',
    category: 'content',
    tags: ['content', 'leverage', 'multiplier', 'framework'],
    created_by: 'Daisy',
    content: `# Content Leverage Framework

## Multiplier Hierarchy
- Framework = 10x (reused forever)
- Tool/Prototype = 5x (users return)
- Research Paper = 3x (cited forever)
- Case Study = 2x (sales enablement)
- Speaking = 1x (one-time reach)
- Blog Post = 0.5x (time > value)

## Rule
Only create content with multiplier ≥ 2x. Prefer frameworks over blog posts.`
  },
  {
    id: 'doc_task_routing',
    title: 'Task Routing Policy',
    filename: 'TASK_ROUTING_POLICY.md',
    type: 'policy',
    category: 'operations',
    tags: ['routing', 'models', 'policy', 'binding'],
    created_by: 'Daisy',
    content: `# Task Routing Policy (Binding)

## Control Brain
- Primary: Claude Opus 4.6
- Fallback: Claude Sonnet 4.5

## Worker Models
1. Customer-facing → Opus 4.5
2. Code/engineering → Codex 5.2
3. Social/trending → Grok
4. Research → Gemini
5. UI/UX → Kimi K2.5
6. Default → Sonnet 4.5`
  },
  {
    id: 'doc_executive_design',
    title: 'Executive Home Design',
    filename: 'EXECUTIVE_HOME_DESIGN.md',
    type: 'design',
    category: 'product',
    tags: ['design', 'executive', 'ui', 'dashboard'],
    created_by: 'Daisy',
    content: `# Executive Home Screen Design

## Core Principle
At-a-glance leverage visibility for Bobby. 5-second scan comprehension.

## Key Sections
1. Top Opportunities (SDS-ranked)
2. Decisions Needed
3. Recent Activity
4. Momentum Metrics

## Implementation
- Everything clickable
- Reduced visual density
- Light/dark mode
- Mobile responsive`
  },
  {
    id: 'doc_phase6_autonomy',
    title: 'Phase 6 Autonomous System',
    filename: 'PHASE6_AUTONOMOUS_SYSTEM.md',
    type: 'technical',
    category: 'system',
    tags: ['autonomy', 'system', 'phase6', 'architecture'],
    created_by: 'Daisy',
    content: `# Phase 6 - Autonomous Operating System

## Core Components
1. SDS as operating system
2. Input pipeline (Brave Search)
3. Decision pipelines
4. Nightly autonomous loop

## Key Decisions
- STATE.md as context lock
- Mission Control as source of truth
- Autonomy without asking`
  },
  {
    id: 'doc_memory_backfill',
    title: 'Memory Backfill - Foundational Context',
    filename: 'MEMORY_BACKFILL.md',
    type: 'system',
    category: 'memory',
    tags: ['memory', 'context', 'history', 'backfill'],
    created_by: 'Daisy',
    content: `# Memory Backfill

## Key Memories
1. System Stabilization Decision
2. Mission Control as System of Record
3. SDS as Operating System
4. Content as Leverage
5. Story Hour Pivot

## Purpose
Provides continuity and coherent system story across sessions.`
  },
  {
    id: 'doc_morning_brief',
    title: 'Morning Strategic Brief Template',
    filename: 'Morning_Strategic_Brief.md',
    type: 'template',
    category: 'operations',
    tags: ['brief', 'morning', 'template', 'daily'],
    created_by: 'Daisy',
    content: `# Morning Strategic Brief

## Format
1. What moved forward (3-5 bullets)
2. What needs attention today
3. SDS opportunities above threshold
4. System health metrics

## Delivery
- Concise executive summary
- Links to Mission Control for detail
- Action-oriented`
  }
]

// Helper to insert
function insertDocument(doc) {
  const exists = db.prepare('SELECT COUNT(*) as count FROM documents WHERE id = ?').get(doc.id)
  if (exists.count > 0) {
    console.log(`⏭️  ${doc.id} already exists`)
    return
  }
  
  db.prepare(`
    INSERT INTO documents (
      id, title, type, file_format, tags, content,
      source_context, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(
    doc.id, doc.title, doc.category, 'markdown', 
    JSON.stringify(doc.tags), doc.content, 
    `Created by ${doc.created_by} for ${doc.type} documentation`
  )
  console.log(`✅ Inserted ${doc.title}`)
}

console.log('=== Populating Documents Library ===\n')

documents.forEach(insertDocument)

// Also link some documents to projects
const projectDocs = [
  { projectId: 'proj_story_hour', docIds: ['doc_nih_sbir_framework', 'doc_story_hour_mvp'] },
  { projectId: 'proj_exec_home', docIds: ['doc_executive_design'] },
  { projectId: 'proj_phase6', docIds: ['doc_phase6_autonomy', 'doc_decision_engine'] },
]

console.log('\nLinking documents to projects...')
projectDocs.forEach(({ projectId, docIds }) => {
  docIds.forEach(docId => {
    try {
      db.prepare(`
        UPDATE documents 
        SET linked_projects = json_insert(
          COALESCE(linked_projects, '[]'), 
          '$[#]', 
          ?
        )
        WHERE id = ?
      `).run(projectId, docId)
      console.log(`✅ Linked ${docId} to ${projectId}`)
    } catch (e) {
      console.log(`⚠️  Could not link ${docId} to ${projectId}`)
    }
  })
})

console.log('\n=== Documents Library Populated ===')
console.log(`Total documents: ${documents.length}`)