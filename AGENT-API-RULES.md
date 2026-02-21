# AGENT-API-RULES.md — MC Section Ownership & Write Rules

## Core Rule
After completing any task, update your assigned MC sections via API.
MC API base: http://localhost:3002/api
Auth header: x-api-key (from .env.local)
Data root: /Users/daisydukes/openclaw-projects/mission-control-data/

## Section Ownership

| Section | API Endpoint | Primary Owner | Secondary |
|---------|-------------|--------------|-----------|
| Command Center | /api/command | River | aggregates from all |
| Approvals | /api/approvals | Daisy | |
| Pipeline | /api/pipeline-state | Scout (opportunities) | Daisy (PRD advancement) |
| Organization | /api/org | River (agent status) | Daisy (role changes) |
| Operations | /api/operations | River (infra, every 15 min) | |
| Build Tracker | /api/build-tracker | Billy/Milo/Bolt (whoever builds) | |
| Briefings | /api/briefings | Scout (delivers) | River (routes to MC) |
| R&D Lab | /api/lab | Daisy (experiment tracking) | proposing agents |
| Content Studio | /api/social-posts | Kobe (posts) | River (feedback relay) |
| Stories | /api/stories | Iris (new stories) | Fern (reviews) + Billy (production) |
| CMS Review | /api/review | Milo (editor status) | Fern (developmental reviews) |
| Strategy | /api/strategy | Daisy (documents) | Bobby (decisions) |
| Insights | /api/sprint-metrics | River (metrics aggregation) | |
| Agent Studio | /api/agents | River (real-time from SESSION_STATE.json) | |
| Litigation Intel | /api/litigation | Scout (research updates) | |

## Write Protocol
1. After task completion, POST/PUT to your section's API endpoint
2. Include x-api-key header for all API calls
3. Build Tracker: whoever completes a build writes their own entry (don't wait for River)
4. Scout: when delivering briefings, also check if opportunities should flow into Pipeline
5. Fern: when completing reviews, update both Stories AND CMS Review
6. River: every 15 min, sweep SESSION_STATE.json and active sessions to update Agent Studio + Operations

## Version-Checked Writes
**All writes are version-checked. If you get a 409 Conflict, retry the request. The API will reject writes if the underlying file changed since your read.**

The API uses optimistic locking with MD5 hashes to prevent concurrent write conflicts. When two agents try to modify the same file simultaneously, the second write will be rejected with HTTP 409 Conflict. Simply retry the operation (the API will fetch the latest version on retry).

## Data Safety Rule — PATCH-Only Updates
**Agents must NEVER read-modify-write full JSON files. Use PATCH /api/{resource}/{id} to update individual records. The API handles the merge.**

Available PATCH endpoints:
- `PATCH /api/social-posts/{id}` - Update individual post by id
- `PATCH /api/pipeline-state/{id}` - Update pipeline item by id
- `PATCH /api/build-tracker/{id}` - Update build task by id

These endpoints use deep merge to safely update records without data loss from concurrent modifications.

## Spawn Prompt Addendum
Include in every agent spawn:
"After completing your task, update your assigned MC sections via the MC API (http://localhost:3002/api). See AGENT-API-RULES.md for your section ownership."
