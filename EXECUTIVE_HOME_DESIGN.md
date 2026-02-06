# Executive Home Screen Design

**Design Rationale:** Optimized for executive scan (under 5 minutes), clarity over completeness, SDS visibility without explanation.

---

## Screen Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  MISSION CONTROL                                        [🌙/☀]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 💰 LEVERAGE OPPORTUNITIES                               │   │
│  │   Ranked by SDS (Strategic Decision Score)              │   │
│  │                                                         │   │
│  │   🔴 32.5 — NIH SBIR Phase I     [Apr 5]  $300K        │   │
│  │      Story Hour with Simon                            │   │
│  │                                                         │   │
│  │   🟠 27.5 — NIMH Digital Mental  [TBD]   $250K         │   │
│  │      Health Innovation                                │   │
│  │                                                         │   │
│  │   🟠 23.0 — GrantScout Commercial [Ongoing] Rev       │   │
│  │      SaaS revenue opportunity                          │   │
│  │                                                         │   │
│  │   [View All Opportunities →]                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ⚡ DECISIONS NEEDED                                     │   │
│  │   What requires your input to proceed                  │   │
│  │                                                         │   │
│  │   [ ] Approve NIH SBIR specific aims draft             │   │
│  │       Due: Tomorrow  |  SDS: 32.5                      │   │
│  │                                                         │   │
│  │   [ ] Review Story Hour MVP scope                      │   │
│  │       Due: This week |  SDS: 30.0                      │   │
│  │                                                         │   │
│  │   [ ] Confirm GrantScout pricing model                 │   │
│  │       Due: This week |  SDS: 23.0                      │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │ 📈 RECENT ACTIVITY  │  │ 🏗️ PROJECTS                    │  │
│  │                     │  │                                 │  │
│  │ • Phase 7 complete  │  │ • System Stabilization ✓       │  │
│  │ • 6 grants scored   │  │ • Story Hour with Simon ●      │  │
│  │ • 3 documents added │  │ • Grant Revenue Engine ●       │  │
│  │ • SDS framework live│  │ • Content Authority Engine ●   │  │
│  │                     │  │ • GrantScout Commercialization ○│  │
│  └─────────────────────┘  └─────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🧠 MONEY / AUTHORITY / OPTIONALITY                     │   │
│  │                                                         │   │
│  │   💵 Revenue Pipeline     $550K+ in identified grants   │   │
│  │   📜 Authority Signals    10+ research citations needed │   │
│  │   🚪 Optionality Doors    NIH path, Foundation path     │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Leverage Opportunities Section

**Data fields:**
- SDS score (prominent, colored)
- Opportunity name
- Deadline badge
- Amount (if financial)
- One-line description
- Link to full details

**Visual treatment:**
- SDS 25+: Red badge, "HIGH PRIORITY"
- SDS 18-24: Yellow badge
- SDS <18: Grayed or hidden

### Decisions Needed Section

**Data fields:**
- Checkbox for "needs Bobby input"
- Task name
- Due date
- SDS score
- "Why this matters" one-liner

**Interaction:**
- Click expands to full task details
- One-click approval workflow
- Quick defer option

### Recent Activity Section

**Scope:** Last 24-48 hours only
**Content:**
- Completed tasks
- New documents
- New decisions logged
- Milestones achieved

### Projects Overview

**Status indicators:**
- ✓ Complete (green)
- ● Active (blue)
- ○ Paused (gray)
- ⏸ Blocked (red)

**Click behavior:** Expands to full project view

---

## UX Improvements

### Light/Dark Mode Toggle
- Top-right corner, clearly visible
- Default: Light mode (white background)
- Dark mode: Current slate/zinc theme

### Visual Hierarchy
```
HEADLINE (24px, bold)    → Section titles
KEY NUMBER (32px, bold)  → SDS scores, amounts
BODY (14px, regular)     → Descriptions
CAPTION (12px, muted)    → Metadata, dates
```

### Text Density
- 40% reduction in paragraph text
- Bullet points preferred
- One-line summaries maximum
- Expandable details on click

---

## SDS Score Legend (inline, collapsible)

```
SDS = (Revenue×2) + (Alignment×2) + (Leverage×1.5) + (TimeFit×1) - (CognitiveLoad×1)

32.5+  → RED    → PURSUE IMMEDIATELY
25-32  → ORANGE → PRIORITY THIS WEEK
18-24  → YELLOW → SCHEDULE FOR LATER
<18    → GRAY   → DELEGATE OR SKIP
```

---

## Implementation Phases

### Phase 1 (This Session) — Design & Structure
- [x] Design rationale documented
- [x] Wireframe specified
- [ ] Create mock data structure

### Phase 2 (Next) — UI Implementation
- [ ] New `/executive` route in Mission Control
- [ ] Light/Dark mode toggle component
- [ ] SDS score badge component
- [ ] Decision approval workflow

### Phase 3 (Refinement) — Integration
- [ ] Connect to existing APIs (projects, tasks, memories)
- [ ] Real-time updates
- [ ] Mobile optimization

---

*Design ready for implementation.*