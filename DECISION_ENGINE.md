# Strategic Decision Engine (System 3)

**Purpose:** Scorable rubric for rapid "yes/no" decisions on opportunities, requests, and choices

**Location:** Mission Control → /decisions (proposed)

---

## The Formula

```
SDS = (Revenue × 2) + (Alignment × 2) + (Leverage × 1.5) + (TimeFit × 1) - (CognitiveLoad × 1)
```

## Scoring Dimensions (1-5 each)

| Dimension | 1 | 3 | 5 |
|-----------|---|---|---|
| **Revenue** | $0 | $10K | $100K+ |
| **Alignment** | No fit with Story Hour thesis | Related | Core to mission |
| **Leverage** | None | Some doors open | Major optionality |
| **TimeFit** | Overloads capacity | Manageable | Perfect timing |
| **CognitiveLoad** | Heavy mental overhead | Moderate | Light, clear |

## Decision Thresholds

| SDS Range | Result | Action |
|-----------|--------|--------|
| ≥ 25 | **YES** | Execute immediately |
| 18-24 | **PROBABLY** | Schedule or delegate |
| 12-17 | **LATER** | Put in backlog |
| < 12 | **NO** | Decline or defer |

## Quick Reference Card

```
┌──────────────────────────────────────────────────────────┐
│          STRATEGIC DECISION SCORECARD                    │
├──────────────────────────────────────────────────────────┤
│  Revenue (1-5)        │ [  ]  ×2  = [  ]                  │
│  Alignment (1-5)      │ [  ]  ×2  = [  ]                  │
│  Leverage (1-5)       │ [  ] ×1.5 = [  ]                  │
│  TimeFit (1-5)        │ [  ]  ×1  = [  ]                  │
│  CognitiveLoad (1-5)  │ [  ]  ×-1 = [  ]                  │
│  ─────────────────────────────────────────────────────  │
│  TOTAL SDS            │ [  ]                              │
│  RESULT               │ [YES/PROBABLY/LATER/NO]           │
└──────────────────────────────────────────────────────────┘
```

## Usage Pattern

1. When presented with opportunity/request/choice
2. Fill out scorecard (takes ~2 minutes)
3. Calculate SDS
4. Make decision based on threshold
5. Record in Mission Control for tracking

## Examples

| Decision | Rev | Align | Lever | TimeFit | Load | SDS | Result |
|----------|-----|-------|-------|---------|------|-----|--------|
| NIH SBIR application | 5 | 5 | 5 | 3 | 2 | 32.5 | YES |
| GrantScout feature dev | 3 | 2 | 3 | 4 | 4 | 20 | PROBABLY |
| Conference attendance | 2 | 2 | 2 | 3 | 3 | 14 | LATER |
| Podcast interview | 2 | 3 | 2 | 4 | 4 | 17 | LATER |
| Generic networking event | 1 | 1 | 2 | 3 | 3 | 9 | NO |

## Mission Control Integration

**Proposed:**
- New `/decisions` route with calculator UI
- Decisions stored in `decisions` table
- Templates for common decision types
- History tracking with outcome follow-up

**Immediate (no code):**
- Copy scorecard to Mission Control as document
- Use Tasks to track decision outcomes
- Log significant decisions as Memories

---

*End of Strategic Decision Engine*