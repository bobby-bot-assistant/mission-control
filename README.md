# Mission Control

Local-first external memory system for Daisy, built with Next.js 14 and SQLite.

## Quick Start

```bash
# Install nvm if not already installed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# Switch to Node 22 LTS (required for better-sqlite3)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22.22.0

# Install dependencies
npm install

# Initialize database (creates data/mission-control.db)
npm run db:init

# Start development server on localhost:3001
npm run dev
```

Visit http://localhost:3001

## API Test Commands (Projects CRUD)

```bash
# Create a project
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","vision":"Testing CRUD","status":"💡 Idea / Brainstorming","priority":"🔴 Critical","category":"Business","started":"2026-02-04","last_active":"2026-02-04","tags":["test"]}'

# Read all projects
curl http://localhost:3001/api/projects

# Update a project
curl -X PUT http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"id":"<PROJECT_ID>","name":"Updated Name"}'

# Delete a project
curl -X DELETE "http://localhost:3001/api/projects?id=<PROJECT_ID>"
```

## Commands

| Command | Description |
|---------|-------------|
| `nvm use 22.22.0` | Switch to required Node version |
| `npm run dev` | Start dev server on port 3001 |
| `npm run build` | Build for production |
| `npm run start` | Run production server |
| `npm run db:init` | Initialize/reinitialize database |
| `npm run lint` | Run ESLint |

## Tech Stack

- Next.js 14 with App Router
- SQLite with better-sqlite3 (requires Node 22)
- Tailwind CSS with dark theme (slate/zinc)
- TypeScript

## Database

Database file: `data/mission-control.db`
Schema: `data/schema.sql`

## Project Structure

```
mission-control/
├── app/
│   ├── api/           # API routes
│   ├── docs/          # Documents screen
│   ├── memory/        # Memory Vault
│   ├── people/        # People CRM
│   ├── projects/      # Projects Hub
│   ├── tasks/         # Task Center
│   └── page.tsx       # Activity Feed (home)
├── components/        # React components
├── data/
│   ├── mission-control.db  # SQLite database
│   └── schema.sql     # Database schema
└── lib/
    ├── db.ts          # Database utilities
    └── projects.ts    # Project CRUD operations
```

## Phase Status

- ✅ Phase 1: Foundation (complete)
- ⏳ Phase 2: Projects Hub
- ⏳ Phase 3: Documents Library
- ⏳ Phase 4: People CRM
- ⏳ Phase 5: Memory Vault
- ⏳ Phase 6: Task Center
- ⏳ Phase 7: Activity Feed
- ⏳ Phase 8: Polish & Auto-Update
