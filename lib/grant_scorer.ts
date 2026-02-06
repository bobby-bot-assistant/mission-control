// Grant Opportunity Scoring Engine
// Priority: HIGH - Revenue path #1
// Purpose: Evaluate and score grant opportunities systematically

interface GrantOpportunity {
  name: string
  agency: string
  amount: number
  deadline: string
  probability: number  // 0-1
  alignment: number    // 0-1 (how well it fits Story Hour thesis)
  effort: number       // hours to apply
  leverage: number     // 0-1 (does it open doors beyond the money?)
}

interface ScoreResult {
  opportunity: GrantOpportunity
  weightedScore: number
  roi: number  // expected return per hour
  recommendation: string
}

// Scoring weights (adjustable)
const WEIGHTS = {
  amount: 0.3,
  probability: 0.25,
  alignment: 0.25,
  leverage: 0.2,
}

// Sample known opportunities
const knownOpportunities: GrantOpportunity[] = [
  {
    name: "NIH SBIR Phase I - Story Hour",
    agency: "NIH/NICHD",
    amount: 300000,
    deadline: "2026-04-05",
    probability: 0.6,
    alignment: 1.0,
    effort: 200,
    leverage: 0.9,  // Opens Phase II, validates thesis
  },
  {
    name: "NIH SBIR Phase II (follow-on)",
    agency: "NIH/NICHD",
    amount: 2000000,
    deadline: "2026-12-01",
    probability: 0.4,
    alignment: 1.0,
    effort: 500,
    leverage: 1.0,  // Major validation, scaling opportunity
  },
  {
    name: "NSF AI for Good",
    agency: "NSF",
    amount: 150000,
    deadline: "2026-06-15",
    probability: 0.3,
    alignment: 0.7,
    effort: 150,
    leverage: 0.6,  // AI credibility, but lower fit
  },
  {
    name: "ED Early Learning",
    agency: "Department of Education",
    amount: 250000,
    deadline: "2026-05-01",
    probability: 0.35,
    alignment: 0.8,
    effort: 180,
    leverage: 0.7,  // Good fit, institutional path
  },
  {
    name: "Robert Wood Johnson Foundation",
    agency: "RWJF",
    amount: 200000,
    deadline: "2026-07-01",
    probability: 0.25,
    alignment: 0.6,
    effort: 120,
    leverage: 0.5,  // Mental health focus, but competitive
  },
  {
    name: "Bill & Melinda Gates Foundation",
    agency: "Gates",
    amount: 500000,
    deadline: "2026-08-01",
    probability: 0.1,
    alignment: 0.7,
    effort: 300,
    leverage: 0.8,  // High leverage if won, but low probability
  },
]

export function scoreGrant(opportunity: GrantOpportunity): ScoreResult {
  const weightedScore = 
    (opportunity.amount / 500000) * WEIGHTS.amount * 10 +
    opportunity.probability * WEIGHTS.probability * 10 +
    opportunity.alignment * WEIGHTS.alignment * 10 +
    opportunity.leverage * WEIGHTS.leverage * 10

  const expectedValue = opportunity.amount * opportunity.probability
  const roi = expectedValue / opportunity.effort

  let recommendation = "REVIEW"
  if (weightedScore >= 7) recommendation = "PURSUE AGGRESSIVELY"
  else if (weightedScore >= 5) recommendation = "WORTH PURSUING"
  else if (weightedScore >= 3) recommendation = "LOW PRIORITY"
  else recommendation = "SKIP"

  return {
    opportunity,
    weightedScore: Math.round(weightedScore * 10) / 10,
    roi: Math.round(roi * 100) / 100,
    recommendation,
  }
}

export function rankOpportunities(opportunities: GrantOpportunity[]): ScoreResult[] {
  return opportunities
    .map(scoreGrant)
    .sort((a, b) => b.weightedScore - a.weightedScore)
}

export function getTopRecommendation(results: ScoreResult[]): ScoreResult | null {
  return results.length > 0 ? results[0] : null
}

// Generate report
export function generateGrantReport(opportunities: GrantOpportunity[]): string {
  const ranked = rankOpportunities(opportunities)
  const top = getTopRecommendation(ranked)
  
  let report = `# Grant Opportunity Analysis Report
Generated: ${new Date().toISOString()}

## TOP PRIORITY
${top ? `**${top.opportunity.name}**
- Score: ${top.weightedScore}/10
- ROI: $${top.roi}/hour
- Recommendation: ${top.recommendation}
- Deadline: ${top.opportunity.deadline}
- Amount: $${top.opportunity.amount.toLocaleString()}
- Expected Value: $${(top.opportunity.amount * top.opportunity.probability).toLocaleString()}` : 'No opportunities found'}

## All Opportunities Ranked

| Rank | Name | Score | ROI | Amount | Prob | Deadline | Rec |
|------|------|-------|-----|--------|------|----------|-----|
`

  ranked.forEach((result, i) => {
    report += `| ${i + 1} | ${result.opportunity.name} | ${result.weightedScore} | $${result.roi} | $${result.opportunity.amount.toLocaleString()} | ${Math.round(result.opportunity.probability * 100)}% | ${result.opportunity.deadline} | ${result.recommendation} |
`
  })

  report += `
## Decision Guidance

**If time is limited:** Focus on opportunities with ROI > $500/hour AND score > 6

**If building pipeline:** Include leverage score > 0.7 for strategic value

**If desperate:** High amount + low probability = high risk, consider only if leverage justifies

## Next Steps

1. [ ] Confirm top 3 priorities
2. [ ] Estimate actual effort for each
3. [ ] Create application timeline
4. [ ] Assign tasks in Mission Control
`

  return report
}

// Quick decision function
export function quickDecide(opportunity: GrantOpportunity): string {
  const result = scoreGrant(opportunity)
  if (result.weightedScore >= 6 && result.roi >= 500) return "YES"
  if (result.weightedScore >= 4 && result.roi >= 200) return "PROBABLY"
  if (result.weightedScore >= 2) return "LATER"
  return "NO"
}

// Run analysis
const report = generateGrantReport(knownOpportunities)
console.log(report)