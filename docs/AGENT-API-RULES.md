# Agent API Rules — Mission Control

## Rule 0: Authentication Required

All API requests (except `/api/health`) require API key authentication.

### API Key Location
The API key is stored in the Mission Control environment file:
- **File**: `mission-control/.env.local`
- **Variable**: `MC_API_KEY`

### Authentication Methods

Include the API key using one of these methods:

#### Header (Recommended)
```bash
curl -H "x-api-key: a67cfc2e96d88eec78d49709c23cc166e3931c956200324da2a0580974783a48" \
  http://localhost:3002/api/projects
```

#### Query Parameter
```bash
curl "http://localhost:3002/api/projects?apiKey=a67cfc2e96d88eec78d49709c23cc166e3931c956200324da2a0580974783a48"
```

### Response Codes
- `200` — Success (authenticated)
- `401` — Unauthorized (missing or invalid key): `{"error":"Unauthorized"}`

### Exception
The `/api/health` endpoint does NOT require authentication (for health checks).

---

## Overview

This document defines the rules and patterns for agents interacting with Mission Control data. All agent operations MUST go through the API layer to ensure data integrity, validation, and backup handling.

---

## Rule 1: All Agents MUST Use MC API Endpoints

**Never write JSON files directly.** Agents must use the API endpoints provided by Mission Control to read and write any data.

### Why?
- API endpoints handle validation before data is written
- All writes create automatic backups
- API endpoints ensure atomic writes (no partial data on failure)
- Centralized error handling and consistent response formats

### How?
```typescript
// ❌ WRONG - Direct file writes
import fs from 'fs'
fs.writeFileSync('data.json', JSON.stringify(data))

// ✅ CORRECT - Use API endpoints
const response = await fetch('/api/projects', {
  method: 'POST',
  body: JSON.stringify(data)
})
```

---

## Rule 2: Use API Endpoints for All Data Operations

### Available Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/agent-status` | Get current agent status |
| GET | `/api/agents` | List all agents |
| GET | `/api/analysis` | Get analysis data |
| GET | `/api/approvals` | List all approvals |
| POST | `/api/approvals` | Create new approval |
| PUT | `/api/approvals` | Update approval |
| DELETE | `/api/approvals` | Delete approval |
| GET | `/api/briefings` | List all briefings |
| POST | `/api/briefings/import` | Import briefing from markdown |
| PATCH | `/api/briefings` | Update briefing signal status |
| GET | `/api/build-tracker` | Get build status |
| POST | `/api/build-tracker` | Create build entry |
| GET | `/api/cms-proxy` | CMS proxy - GET |
| POST | `/api/cms-proxy` | CMS proxy - POST |
| GET | `/api/cms/jobs` | List CMS jobs |
| GET | `/api/cms/jobs/[jobId]` | Get specific job |
| POST | `/api/cms/jobs/[jobId]/review` | Submit job review |
| POST | `/api/cms/jobs/[jobId]/suggest-cuepoints` | Suggest cuepoints |
| GET | `/api/cms/jobs/[jobId]/timeline` | Get job timeline |
| GET | `/api/content-scripts` | List content scripts |
| POST | `/api/content-scripts` | Create content script |
| DELETE | `/api/content-scripts/[id]` | Delete content script |
| GET | `/api/decisions` | List decisions |
| GET | `/api/decisions/interactions` | Get decision interactions |
| POST | `/api/decisions/interactions` | Log decision interaction |
| GET | `/api/documents` | List documents |
| GET | `/api/feedback` | List feedback |
| POST | `/api/feedback` | Submit feedback |
| GET | `/api/health` | Health check |
| GET | `/api/integrity-check` | Data integrity check |
| GET | `/api/lab` | List lab items |
| POST | `/api/lab` | Create lab item |
| GET | `/api/lab/interactions` | Get lab interactions |
| POST | `/api/lab/interactions` | Log lab interaction |
| GET | `/api/litigation` | Get litigation data |
| GET | `/api/memories` | List memories |
| POST | `/api/memories` | Create memory |
| GET | `/api/openclaw-status` | OpenClaw status |
| GET | `/api/operations` | List operations |
| POST | `/api/operations` | Create operation |
| PUT | `/api/operations` | Update operation |
| GET | `/api/operations/interactions` | Get operations interactions |
| POST | `/api/operations/interactions` | Log operations interaction |
| GET | `/api/opportunities` | List opportunities |
| GET | `/api/outreach-documents` | List outreach documents |
| POST | `/api/outreach-documents` | Create outreach document |
| PUT | `/api/outreach-documents` | Update outreach document |
| GET | `/api/outreach-documents/[id]` | Get specific document |
| GET | `/api/outreach-documents/[id]/download` | Download document file |
| POST | `/api/outreach-documents/upload` | Upload document file |
| GET | `/api/people` | List people |
| POST | `/api/people` | Create person |
| GET | `/api/people/[id]` | Get specific person |
| PUT | `/api/people/[id]` | Update person |
| GET | `/api/pipeline-state` | Get pipeline state |
| POST | `/api/pipeline-state` | Update pipeline state |
| GET | `/api/pipeline/interactions` | Get pipeline interactions |
| POST | `/api/pipeline/interactions` | Log pipeline interaction |
| POST | `/api/pipeline/approve` | Approve pipeline brief |
| GET | `/api/pipeline/feedback` | Get pipeline feedback |
| POST | `/api/pipeline/feedback` | Submit pipeline feedback |
| GET | `/api/pipeline/briefs/[id]` | Get specific brief |
| GET | `/api/prds/[id]` | Get PRD |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects` | Update project |
| GET | `/api/projects/interactions` | Get project interactions |
| POST | `/api/projects/interactions` | Log project interaction |
| GET | `/api/social-posts` | List social posts |
| POST | `/api/social-posts` | Create social post |
| GET | `/api/sprint-metrics` | Get sprint metrics |
| PUT | `/api/sprint-metrics` | Update sprint metrics |
| GET | `/api/stories` | List stories |
| PUT | `/api/stories` | Update story |
| GET | `/api/strategy` | Get strategy docs (with ?slug= for specific) |
| GET | `/api/tasks` | List tasks |
| POST | `/api/seed-outreach` | Seed outreach documents |

---

## Rule 3: All Writes Go Through the API

The API handles:
1. **Validation** — Input data is validated before writing
2. **Backup** — Automatic `.backup.json` files created before writes
3. **Atomic Operations** — Write to temp file, then rename (no partial files)
4. **Error Handling** — Consistent error responses

### Write Flow
```
Agent → API Endpoint → Validation → Backup → Write → Response
```

---

## Rule 4: Schemas Are the Source of Truth

All data shapes are defined in `lib/schemas.ts`. Use these types for type safety.

### Key Schemas

```typescript
// Social Posts
interface SocialPost {
  id: string
  title: string
  scheduledDate: string
  platforms: {
    linkedin?: { content: string, status: 'draft' | 'ready' | 'sent' | 'scheduled' }
    x?: { content: string, status: 'draft' | 'ready' | 'sent' | 'scheduled' }
  }
  tags: string[]
  createdAt: string
  updatedAt: string
  archivedAt?: string | null
  feedback?: string | null
  feedbackStatus?: 'pending' | 'done' | 'relayed'
}

// Stories
interface Story {
  id: string
  title: string
  year?: number
  creator?: string
  type: 'video' | 'audio' | 'interactive' | 'book'
  duration?: string
  ageRange: string
  synopsis: string
  status: 'Showcase' | 'Draft' | 'Review' | 'Archive'
  wave?: number
  // ... more fields
}

// Lab Items
interface LabItem {
  id: string
  title: string
  description: string
  type: 'improvement' | 'feature' | 'fix' | 'experiment'
  status: 'shipped' | 'in-progress' | 'queued' | 'archived'
  builtBy: string
  builtDate?: string
  notes?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
}

// Pipeline Feedback
interface PipelineFeedback {
  id: string
  briefId: string
  feedback: string
  requestedBy?: string
  timestamp: string
  status: 'pending' | 'relayed' | 'resolved'
  relayedTo?: string | null
  resolvedAt?: string | null
}

// PRD Queue
interface PRDQueueItem {
  id: string
  briefId: string
  status: 'queued' | 'in-progress' | 'completed' | 'on-hold'
  requestedAt: string
  stages: {
    research: 'pending' | 'in-progress' | 'completed'
    clinical: 'pending' | 'in-progress' | 'completed'
    positioning: 'pending' | 'in-progress' | 'completed'
    synthesis: 'pending' | 'in-progress' | 'completed'
  }
}
```

Full schema definitions are in `lib/schemas.ts`.

---

## Data Library Functions

For reading/writing from API routes, these helper functions are available:

```typescript
import { readJSON, writeJSON, readJSONArray } from '@/lib/data'
import { dataPath } from '@/lib/config'

// Read JSON file (returns empty object if not found)
const data = await readJSON<MyType>('path/to/file.json')

// Read JSON array (returns empty array if not found)
const items = await readJSONArray<MyItem[]>('path/to/items.json')

// Write JSON file (creates backup automatically)
await writeJSON('path/to/file.json', data)

// Get full path to data directory
const fullPath = dataPath('relative/path.json')
```

---

## Common Patterns

### Reading Data
```typescript
// GET request to own API
const response = await fetch('/api/projects')
const projects = await response.json()
```

### Writing Data
```typescript
// POST request
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'New Project', ... })
})
const result = await response.json()
```

### Updating Data
```typescript
// PUT request
const response = await fetch('/api/projects', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: '123', updates: {...} })
})
```

---

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

HTTP status codes:
- `200` — Success
- `201` — Created
- `400` — Bad Request (validation failed)
- `404` — Not Found
- `500` — Server Error

---

## File Locations

- **Data Directory**: `/Users/daisydukes/openclaw-projects/mission-control-data/`
- **API Routes**: `app/api/`
- **Schemas**: `lib/schemas.ts`
- **Data Helpers**: `lib/data.ts`
- **Config**: `lib/config.ts`
