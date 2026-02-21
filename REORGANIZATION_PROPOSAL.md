# Mission Control Reorganization Proposal

## Current Structure (13 sections)
Executive, Research, Content Studio, Timeline, Projects, Tasks, Analysis, Documents, People, Memory, Insights, Activity, (+ Pipeline)

## Proposed Structure (7 sections)

### 1. 🎯 Command (formerly Executive)
**Contains:** Executive dashboard, key metrics, decision queue
**Why:** Better name that implies control and overview

### 2. 🚀 Pipeline
**Contains:** Opportunities → Ideas → PRDs → MVPs (The River)
**Absorbs:** Analysis (becomes part of opportunity scoring)
**Why:** Central workflow for value creation

### 3. 📋 Operations
**Nested sections:**
- Tasks (current task management)
- Projects (current project tracking)  
- Timeline (calendar view)
**Why:** Groups all execution tracking in one place

### 4. 🎬 Studio
**Contains:** Content Studio (scripts, recordings)
**Why:** Creative production space, distinct from operations

### 5. 📚 Knowledge
**Nested sections:**
- Documents (current docs)
- Research (grant/regulatory findings)
- Memory (workspace memories)
**Why:** All information storage in one place

### 6. 🤝 Network
**Contains:** People (relationships, contacts)
**Why:** Clearer than "People" - implies connections and ecosystem

### 7. 📊 Insights
**Absorbs:** Activity (becomes part of insights)
**Why:** All analytics and patterns in one place

## Visual Hierarchy

```
Mission Control
├── 🎯 Command
├── 🚀 Pipeline
├── 📋 Operations
│   ├── Tasks
│   ├── Projects
│   └── Timeline
├── 🎬 Studio
├── 📚 Knowledge
│   ├── Documents
│   ├── Research
│   └── Memory
├── 🤝 Network
└── 📊 Insights
```

## Benefits

1. **50% fewer top-level items** (13 → 7)
2. **Clearer mental model** - each section has distinct purpose
3. **Logical nesting** - related items grouped
4. **Better names** - "Command" > "Executive", "Network" > "People"
5. **Workflow-centric** - Pipeline gets prime position

## Migration Notes

- No data loss - just reorganization
- URLs can redirect (old → new)
- Gradual rollout possible
- Search/Command Palette finds everything regardless

This structure scales better as we add agents and features. Each section maps to a clear domain of work.