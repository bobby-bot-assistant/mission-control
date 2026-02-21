'use client'

import { useState } from 'react'
import Link from 'next/link'

const cases = [
  { id: 'meta-youtube-la', title: 'California State Trial', status: 'ACTIVE', statusColor: 'bg-red-500', date: 'Jan 27, 2026', amount: '$1-2B est.', desc: 'State of California vs. Meta, YouTube. First state AG multi-defendant trial.' },
  { id: 'nm-vs-meta', title: 'New Mexico vs. Meta', status: 'TRIAL LIVE', statusColor: 'bg-red-500', date: 'Feb 2026', amount: '$1B+ est.', desc: 'First state AG child safety trial - Meta accused of "marketplace for predators".' },
  { id: 'tiktok', title: 'TikTok Settlement', status: 'SETTLED', statusColor: 'bg-green-500', date: 'Jan 2026', amount: '$500M-1B est.', desc: 'Children\'s privacy and safety claims resolved.' },
  { id: 'snapchat', title: 'Snapchat Settlement', status: 'SETTLED', statusColor: 'bg-green-500', date: '2025', amount: '$100-300M est.', desc: 'Youth mental health harm claims resolved.' },
  { id: 'tx-vs-snap', title: 'Texas AG vs. Snapchat', status: 'FILED', statusColor: 'bg-amber-500', date: 'Feb 12, 2026', amount: 'TBD', desc: 'Texas AG Paxton lawsuit alleging misrepresentations to parents.' },
  { id: 'federal-mdl', title: 'Federal MDL (Oakland)', status: '2,800+ CASES', statusColor: 'bg-amber-500', date: 'Trial: June 15, 2026', amount: '$2-5B est.', desc: 'Consolidated multi-district litigation. Judge set bellwether trial date.' },
  { id: 'state-ag', title: 'State AG Actions', status: '40+ STATES', statusColor: 'bg-purple-500', date: 'Ongoing', amount: 'TBD', desc: 'Bipartisan enforcement wave. 18 AGs jointly sued Meta.' },
]

const legislation = [
  { id: 'kosa', title: 'Kids Online Safety Act (KOSA)', status: 'SENATE', statusColor: 'bg-blue-500', scope: 'FEDERAL', desc: 'Bipartisan bill with duty of care requirements. 40+ AGs support. S.1748' },
  { id: 'ca-cadca', title: 'CA Age-Appropriate Design Code', status: 'ENACTED', statusColor: 'bg-green-500', scope: 'STATE', desc: 'California Kids Code - requires privacy by default for minors' },
  { id: 'ny-sopa', title: 'NY Stop Online Predators Act', status: 'BUDGET', statusColor: 'bg-amber-500', scope: 'STATE', desc: 'Hochul included in 2026 budget. Age verification + privacy defaults' },
  { id: 'al-hb161', title: 'Alabama HB161', status: 'ADVANCING', statusColor: 'bg-amber-500', scope: 'STATE', desc: 'Child online safety enforcement bill advancing Feb 2026' },
  { id: 'coppa-updates', title: 'COPPA Updates', status: 'COMPLIANCE DUE', statusColor: 'bg-amber-500', scope: 'FEDERAL', desc: 'Updated regs took effect June 2025. Deadline April 22, 2026' },
]

const cyPresPrecedents = [
  { case: 'Google+ Privacy (2020)', amount: '$7.5M' },
  { case: 'Facebook Privacy (2022)', amount: '$25M' },
  { case: 'Equifax Breach (2020)', amount: '$77M' },
  { case: 'Yahoo Breach (2020)', amount: '$30M' },
]

const revenueStreams = [
  { stream: 'Cy Pres Funds', entity: 'Foundation', range: '$500K–5M', icon: '🏛️', timeline: '2026-2028' },
  { stream: 'Expert Witness', entity: 'Bobby (personal)', range: '$100–500K/yr', icon: '⚖️', timeline: 'Immediate' },
  { stream: 'Advisory Consulting', entity: 'Network', range: '$120–500K/yr', icon: '💼', timeline: 'Immediate' },
  { stream: 'NIH SBIR Grant', entity: 'Foundation', range: '$300K Phase I', icon: '🔬', timeline: '2026' },
  { stream: 'Speaking', entity: 'Bobby (personal)', range: '$50–150K/yr', icon: '🎤', timeline: 'Immediate' },
]

const actionItems = [
  { action: 'Register as potential cy pres recipient', priority: 'CRITICAL', details: 'Need 501(c)(3) letter, mission statement, board resolution, program descriptions' },
  { action: 'Build expert witness CV/credentials page', priority: 'HIGH', details: 'Qualifications, publications, media appearances for litigation context' },
  { action: 'Identify top 10 MDL law firms for outreach', priority: 'HIGH', details: 'Lead counsel in Oakland MDL, plaintiff-side firms, decision-makers' },
  { action: 'Prepare school district pitch deck', priority: 'MEDIUM', details: '5-10 slides for superintendents explaining landscape + advisory services' },
  { action: 'Deploy Advisory Kit landing page', priority: 'HIGH', details: 'advisory-kit/ is built. Review copy, add Formspree IDs, deploy.' },
]

export default function LitigationPage() {
  const [cyPresPercent, setCyPresPercent] = useState(5)
  const poolLow = 200_000_000
  const poolHigh = 500_000_000
  const estLow = Math.round(poolLow * cyPresPercent / 100)
  const estHigh = Math.round(poolHigh * cyPresPercent / 100)

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
    return `$${n}`
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⚖️</span>
            <h1 className="text-3xl font-bold">Litigation Intelligence</h1>
            <span className="bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-500/30 animate-pulse">LIVE</span>
          </div>
          <p className="text-foreground-subtle">Track the social media litigation wave & Mindful Media's positioning opportunity</p>
        </div>

        {/* Settlement Tracker */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">📋 Settlement Tracker</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases.map(c => (
              <div key={c.id} className="bg-surface border border-border rounded-xl p-5 hover:border-foreground-subtle transition">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-sm">{c.title}</h3>
                  <span className={`${c.statusColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>{c.status}</span>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{c.amount}</div>
                <div className="text-xs text-foreground-subtle">{c.date}</div>
                <p className="text-xs text-foreground-subtle mt-2">{c.desc}</p>
              </div>
            ))}
            {/* Total */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-5">
              <h3 className="font-semibold text-sm text-blue-400 mb-3">Total Opportunity</h3>
              <div className="text-2xl font-bold mb-1">$2–5B</div>
              <div className="text-xs text-foreground-subtle">Estimated liability pool</div>
              <div className="text-lg font-bold text-blue-400 mt-2">$200–500M</div>
              <div className="text-xs text-foreground-subtle">Estimated cy pres potential</div>
            </div>
          </div>
        </section>

        {/* Legislation Tracker */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">🏛️ Legislation Tracker</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {legislation.map(l => (
              <div key={l.id} className="bg-surface border border-border rounded-xl p-5 hover:border-foreground-subtle transition">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-sm">{l.title}</h3>
                  <span className={`${l.statusColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>{l.status}</span>
                </div>
                <div className="text-xs text-blue-400 font-semibold mb-1">{l.scope}</div>
                <p className="text-xs text-foreground-subtle mt-2">{l.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cy Pres Calculator */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">🧮 Cy Pres Opportunity Calculator</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-3">What are Cy Pres Funds?</h3>
              <p className="text-sm text-foreground-subtle mb-4">
                When class action settlements have unclaimed funds, courts direct money to nonprofits whose missions address the harm at issue. In children's social media cases, this means organizations working on youth digital safety, mental health, and ethical media design.
              </p>
              <h3 className="font-semibold mb-3">Why Mindful Media Foundation Qualifies</h3>
              <ul className="text-sm text-foreground-subtle space-y-2">
                <li>✅ 501(c)(3) focused on children's media & mental health</li>
                <li>✅ Active research (Story Hour, ethical design frameworks)</li>
                <li>✅ Direct mission alignment with settlement terms</li>
                <li>✅ Founder with demonstrated expertise in the space</li>
              </ul>
            </div>
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Estimate Your Addressable Pool</h3>
              <label className="text-sm text-foreground-subtle block mb-2">
                Allocation assumption: <strong className="text-foreground">{cyPresPercent}%</strong> of cy pres funds
              </label>
              <input
                type="range" min={1} max={20} value={cyPresPercent}
                onChange={e => setCyPresPercent(Number(e.target.value))}
                className="w-full mb-4 accent-blue-500"
              />
              <div className="bg-surface-hover/50 rounded-lg p-4 text-center mb-4">
                <div className="text-3xl font-bold text-blue-400">{fmt(estLow)} – {fmt(estHigh)}</div>
                <div className="text-xs text-foreground-subtle mt-1">Estimated addressable amount for Mindful Media Foundation</div>
              </div>
              <h4 className="text-sm font-semibold mb-2">Precedents</h4>
              <div className="space-y-1">
                {cyPresPrecedents.map(p => (
                  <div key={p.case} className="flex justify-between text-xs text-foreground-subtle">
                    <span>{p.case}</span>
                    <span className="font-semibold text-foreground-muted">{p.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Revenue Opportunity Map */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">💰 Revenue Opportunity Map</h2>
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {revenueStreams.map(r => (
                <div key={r.stream} className="text-center p-4 bg-background-subtle/50 rounded-lg">
                  <div className="text-3xl mb-2">{r.icon}</div>
                  <div className="font-semibold text-sm mb-1">{r.stream}</div>
                  <div className="text-lg font-bold text-blue-400">{r.range}</div>
                  <div className="text-[10px] text-foreground-subtle mt-1">{r.entity}</div>
                  <div className="text-[10px] text-foreground-subtle">{r.timeline}</div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="text-sm text-foreground-subtle mb-1">Total Addressable Opportunity (Conservative)</div>
              <div className="text-3xl font-extrabold text-green-400">$1.07M – $6.45M</div>
              <div className="text-xs text-foreground-subtle mt-1">Across all revenue streams over 2026-2028</div>
            </div>
          </div>
        </section>

        {/* Action Items */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">🎯 Action Items</h2>
          <div className="space-y-3">
            {actionItems.map((item, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-5 flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-sm font-bold">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-sm">{item.action}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      item.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-background-subtle/20 text-foreground-subtle border border-border-subtle'
                    }`}>{item.priority}</span>
                  </div>
                  <p className="text-xs text-foreground-subtle">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Outreach Pipeline CTA */}
        <section className="mb-10">
          <Link
            href="/people?filter=cy-pres-outreach"
            className="block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl p-6 transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-purple-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl">⚖️→👥</span>
                <div>
                  <h3 className="text-xl font-bold text-white">View Outreach Pipeline</h3>
                  <p className="text-blue-100/80 text-sm">Track cy pres outreach contacts, status, and engagement</p>
                </div>
              </div>
              <span className="text-white text-2xl">→</span>
            </div>
          </Link>
        </section>

        <div className="text-xs text-foreground-subtle text-center py-4">Last updated: February 13, 2026 · Data is estimated and for strategic planning purposes</div>
      </div>
    </div>
  )
}
