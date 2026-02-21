# System Design Proposals
*February 6, 2026*

## 1. Theme System Architecture

### The Problem
Repeated light mode failures across components: black backgrounds, invisible text, inconsistent dark mode classes. We're fixing symptoms, not the disease.

### Root Cause Analysis
- Components built in isolation with hardcoded dark styles
- No centralized theme provider
- Inconsistent dark mode class usage (`dark:` prefix)
- No automated testing for theme states

### Proposed Solution: Unified Theme System

#### Option A: Global CSS Variables (Recommended)
```css
/* globals.css */
:root {
  --background: 251 250 249; /* zinc-50 */
  --foreground: 24 24 27;    /* zinc-900 */
  --card: 255 255 255;       /* white */
  --card-foreground: 24 24 27;
  --popover: 255 255 255;
  --popover-foreground: 24 24 27;
  --primary: 24 24 27;
  --primary-foreground: 251 250 249;
  /* ... more tokens */
}

.dark {
  --background: 9 9 11;      /* zinc-950 */
  --foreground: 251 250 249; /* zinc-50 */
  --card: 24 24 27;          /* zinc-900 */
  --card-foreground: 251 250 249;
  /* ... inverted values */
}
```

**Implementation:**
1. Define semantic color tokens
2. Replace all hardcoded colors with CSS variables
3. Components use `bg-background`, `text-foreground` etc.
4. Single source of truth for theming

#### Option B: Component Library with Theme Provider
- Wrap entire app in ThemeProvider
- Each component receives theme via context
- More JavaScript-heavy but type-safe

### Immediate Actions
1. Create `styles/theme.css` with CSS variables
2. Update Tailwind config to use CSS variables
3. Audit and update all existing components
4. Add visual regression tests for light/dark modes

---

## 2. Context Management Strategy

### The Problem
Hit 200K token limit, losing critical context mid-conversation. As workspace grows, this will worsen.

### Root Cause Analysis
- Everything loads into context (AGENTS.md, SOUL.md, memory files)
- No prioritization of what's essential vs retrievable
- No summarization strategy
- Accumulating conversation history

### Proposed Solution: Tiered Context System

#### Tier 1: Always Loaded (Core Identity ~5K tokens)
```
SOUL.md (condensed version)
USER.md (key facts only)
Current date/time
Active cron jobs
Today's key decisions/tasks
```

#### Tier 2: Smart Loading (Retrieved as needed ~20K tokens)
```
AGENTS.md (loaded on session start)
TOOLS.md (loaded when using tools)
Recent memory files (last 48h)
Active project context
```

#### Tier 3: On-Demand (Search/retrieve)
```
Older memory files
Research documents
Historical conversations
Completed projects
```

### Implementation Strategy

1. **Create SOUL_CORE.md** - Ultra-condensed version (< 1K tokens)
   - Who I am (Daisy, AI co-founder)
   - Core mission (Mindful Media)
   - Key constraints (Bobby's time, funding urgency)

2. **Smart Context Loader**
   ```typescript
   // context-manager.ts
   class ContextManager {
     async loadEssentials() {
       return ['SOUL_CORE.md', 'USER_CORE.md', 'memory/today.md']
     }
     
     async loadForTask(taskType: string) {
       if (taskType === 'technical') return ['TOOLS.md']
       if (taskType === 'strategic') return ['MEMORY.md']
       // ... task-specific loading
     }
   }
   ```

3. **Session Summarization**
   - Every 50K tokens, summarize conversation
   - Store summary in daily memory
   - Reset conversation with summary + essentials

### Immediate Actions
1. Create condensed core files
2. Implement memory_search more aggressively
3. Add context usage monitor to track token consumption
4. Build session rotation strategy

---

## 3. Integrated Decision Framework

### The Problem
Decision-making requires back-and-forth chat. It's slow, context-heavy, and not trackable.

### Root Cause Analysis
- SDS framework exists but isn't embedded in UI
- No structured decision capture
- Can't track decision history
- No proactive decision surfacing

### Proposed Solution: Decision Command Center

#### UI Design
```
┌─────────────────────────────────────┐
│ 🤔 Decision Center                  │
├─────────────────────────────────────┤
│ Active Decisions (3)                │
│ ┌─────────────────────────────────┐ │
│ │ GrantScout vs NIH Focus         │ │
│ │ Due: Today | SDS: --            │ │
│ │ [Score Now] [Ask Daisy]         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [+ New Decision]                    │
└─────────────────────────────────────┘
```

#### Decision Flow
1. **Quick Capture**: Title + deadline
2. **Self-Score** (optional): Use SDS framework directly
3. **AI Analysis** (optional): Get Daisy's recommendation
4. **Track**: Log decision + rationale
5. **Review**: Weekly decision review

#### Data Model
```typescript
interface Decision {
  id: string
  title: string
  created: Date
  deadline?: Date
  status: 'pending' | 'made' | 'deferred'
  options: DecisionOption[]
  finalChoice?: string
  rationale?: string
  sdsScores?: SDSScore
  daisyAnalysis?: string
}

interface DecisionOption {
  id: string
  title: string
  pros: string[]
  cons: string[]
  userScore?: SDSBreakdown
  aiScore?: SDSBreakdown
}
```

### Implementation Options

#### Option A: Integrated Page (Recommended)
- New `/decisions` page in Mission Control
- Quick scoring interface
- Historical decision log
- API endpoint for Daisy to add decisions

#### Option B: Command Palette Integration
- `Cmd+K → New Decision`
- Quick decision capture
- Lighter weight but less discoverable

### Proactive Decision Surfacing
1. **From Tasks**: Tasks with "Decision:" prefix auto-create decision
2. **From Opportunities**: High SDS opportunities suggest decisions
3. **From Cron**: Weekly decision review reminder
4. **From Context**: Daisy detects decision language, suggests capture

### Immediate Actions
1. Build `/decisions` page with SDS scoring UI
2. Create decision API endpoints
3. Add "Convert to Decision" button on tasks/opportunities
4. Implement weekly decision review cron

---

## Priority Order

1. **Theme System** (1 day) - Prevents ongoing UI issues
2. **Decision Framework** (2-3 days) - Immediate productivity gain  
3. **Context Management** (ongoing) - Complex but critical for scale

Each solution addresses root causes, not symptoms. Ready to implement based on your preferences.