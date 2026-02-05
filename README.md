# Mission Control

Local-first external memory system for Daisy, built with Next.js 14 and SQLite.

## Quick Start

```bash
# Install dependencies
npm install

# Initialize database (creates data/mission-control.db)
npm run db:init

# Start development server on localhost:3001
npm run dev
```

Visit http://localhost:3001

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3001 |
| `npm run build` | Build for production |
| `npm run start` | Run production server |
| `npm run db:init` | Initialize/reinitialize database |
| `npm run lint` | Run ESLint |

## Tech Stack

- Next.js 14 with App Router
- SQLite with sql.js (pure JS, no native deps)
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
