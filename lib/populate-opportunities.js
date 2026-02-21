// Populate opportunities table

const DB_PATH = './data/mission-control.db'
const Database = require('./json-db')
const db = new Database(DB_PATH)
db.pragma('foreign_keys = ON')

// Opportunities data
const opportunities = [
  {
    id: 'opp_nih_sbir',
    name: 'NIH SBIR Phase I',
    description: 'Story Hour with Simon - preventive mental health',
    sds_score: 32.5,
    amount: '$300K',
    deadline: 'Apr 5, 2026',
    result: 'YES',
    related_project_id: 'proj_story_hour',
    reasoning: 'Highest SDS score due to: (1) Revenue potential $300K → $2M, (2) Perfect alignment with preventive mental health mission, (3) High leverage - unlocks Phase II and credibility, (4) Timeline fits Q2 2026 capacity, (5) Low cognitive load with clear SBIR framework',
    tags: ['nih', 'sbir', 'story-hour', 'grant', 'priority']
  },
  {
    id: 'opp_nimh_digital',
    name: 'NIMH Digital Mental Health',
    description: 'Innovation NOFO for digital interventions',
    sds_score: 27.5,
    amount: '$250K',
    deadline: 'TBD',
    result: 'YES',
    related_project_id: 'proj_story_hour',
    reasoning: 'Strong SDS due to: (1) Direct NIMH alignment, (2) Innovation focus matches our AI approach, (3) Can leverage NIH SBIR work, (4) Builds federal funding track record',
    tags: ['nimh', 'digital-health', 'grant', 'innovation']
  },
  {
    id: 'opp_grantscout',
    name: 'GrantScout Commercialization',
    description: 'SaaS revenue opportunity',
    sds_score: 23.0,
    amount: 'Revenue Stream',
    deadline: 'Ongoing',
    result: 'YES',
    related_project_id: 'proj_grant_engine',
    reasoning: 'Revenue diversification opportunity: (1) Existing codebase, (2) Clear market need, (3) Subscription model, (4) Low marginal cost, (5) Supports grant-seeking community',
    tags: ['saas', 'revenue', 'grantscout', 'commercialization']
  },
  {
    id: 'opp_samhsa_youth',
    name: 'SAMHSA Youth Grants',
    description: 'Youth mental health funding',
    sds_score: 22.5,
    amount: 'TBD',
    deadline: 'Oct 1, 2026',
    result: 'PROBABLY',
    related_project_id: 'proj_story_hour',
    reasoning: 'Aligned with youth mental health focus, but requires significant new research component',
    tags: ['samhsa', 'youth', 'mental-health', 'grant']
  },
  {
    id: 'opp_nsf_ai',
    name: 'NSF AI for Good',
    description: 'AI credibility building',
    sds_score: 20.0,
    amount: '$150K',
    deadline: 'Jun 15, 2026',
    result: 'PROBABLY',
    related_project_id: 'proj_content_engine',
    reasoning: 'Builds AI research credibility, moderate funding, requires technical paper',
    tags: ['nsf', 'ai', 'research', 'grant']
  },
  {
    id: 'opp_blank_foundation',
    name: 'Blank Foundation $25M',
    description: 'Youth mental health initiative',
    sds_score: 20.0,
    amount: 'TBD',
    deadline: 'Rolling',
    result: 'PROBABLY',
    related_project_id: 'proj_story_hour',
    reasoning: 'Large potential funding but highly competitive, requires proven traction',
    tags: ['foundation', 'youth', 'mental-health', 'large-grant']
  }
]

// Helper to insert
function insertOpportunity(opp) {
  const exists = db.prepare('SELECT COUNT(*) as count FROM opportunities WHERE id = ?').get(opp.id)
  if (exists.count > 0) {
    console.log(`⏭️  ${opp.id} already exists`)
    return
  }
  
  db.prepare(`
    INSERT INTO opportunities (
      id, name, description, sds_score, amount, deadline, 
      result, related_project_id, reasoning, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    opp.id, opp.name, opp.description, opp.sds_score, opp.amount, 
    opp.deadline, opp.result, opp.related_project_id || null, 
    opp.reasoning, JSON.stringify(opp.tags)
  )
  console.log(`✅ Inserted ${opp.name}`)
}

console.log('=== Populating Opportunities ===\n')

opportunities.forEach(insertOpportunity)

console.log('\n=== Opportunities Populated ===')
console.log(`Total opportunities: ${opportunities.length}`)

// Show summary
const summary = db.prepare(`
  SELECT result, COUNT(*) as count, SUM(sds_score) as total_sds
  FROM opportunities 
  GROUP BY result
  ORDER BY result
`).all()

console.log('\nSummary by result:')
summary.forEach(s => {
  console.log(`  ${s.result}: ${s.count} opportunities (total SDS: ${s.total_sds})`)
})

db.close()