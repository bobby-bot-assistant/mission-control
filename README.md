# Mission Control

Local-first external memory system for Daisy. Built with Next.js 14 and SQLite. Internal tool for project tracking, task management, people relationships, document storage, and memory capture.

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

# Seed with initial data (optional)
npm run seed

# Start development server
npm run dev
```

Visit http://localhost:3001

## Features

### Activity Feed (Home)
Unified dashboard showing recent activity across all systems:
- Projects, Tasks, People, Documents, and Memories
- Quick stats: active projects, tasks, people count, documents, memories
- Links to all major sections

### Projects Hub
Full project lifecycle management:
- Create, edit, delete projects with modal forms
- Track status (Idea → Completed), priority, and category
- Filter by status, priority, or search by name/vision/tags
- Auto-updates last_active on changes
- Supports codenames and target ETA

### Tasks Command Center
Kanban-style task management:
- Board view with 5 status columns (Backlog, Up Next, In Progress, Review, Done)
- List view for detailed task management
- Link tasks to projects
- Priority levels (Critical, High, Medium, Low)
- Due dates and subtask support
- Quick status updates from board

### People CRM
Relationship management system:
- Track contacts with relationship types (Friend, Professional, Client, etc.)
- Store contact info (email, phone, LinkedIn, Twitter)
- Record last contact dates and follow-up reminders
- Filter by relationship type, search by name/organization
- Tag and organize contacts

### Documents Library
Document storage with markdown support:
- Create, edit, delete documents
- Grid and list view options
- Markdown rendering in document viewer
- Link documents to projects
- Filter by document type (Note, Report, Script, Template, etc.)
- Word count and summary tracking
- Auto-capture via API for chat integration

### Memory Vault
Quick capture of decisions, learnings, and context:
- Quick capture input (press Enter to save)
- Full form for detailed entries
- Categories: Decision, Learning, Idea, Context, Mistake, Win, Reference
- Filter by category, search across all memories
- Link to projects

## Navigation

Sidebar navigation provides access to all sections:
- 📊 Activity (Home)
- 📁 Projects
- 📋 Tasks
- 👥 People
- 📄 Documents
- 🧠 Memory

## API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/projects` | GET, POST, PUT, DELETE | Project CRUD with search/filter |
| `/api/tasks` | GET, POST, PUT, DELETE | Task CRUD with project/status filter |
| `/api/people` | GET, POST, PUT, DELETE | People CRUD with search |
| `/api/documents` | GET, POST, PUT, DELETE | Document CRUD with auto-capture |
| `/api/memories` | GET, POST, PUT, DELETE | Memory CRUD with search |

## Commands

| Command | Description |
|---------|-------------|
| `nvm use 22.22.0` | Switch to Node 22 |
| `npm run dev` | Start dev server (port 3001) |
| `npm run build` | Build for production |
| `npm run start` | Run production server |
| `npm run db:init` | Initialize/reinitialize database |
| `npm run seed` | Seed with sample data |
| `npm run lint` | Run ESLint |

## Tech Stack

- Next.js 14 with App Router
- SQLite with better-sqlite3 (Node 22 required)
- Tailwind CSS (dark theme, slate/zinc)
- TypeScript

## Project Structure

```
mission-control/
├── app/
│   ├── api/           # API routes (projects, tasks, people, documents, memories)
│   ├── docs/          # Documents Library
│   ├── memory/        # Memory Vault
│   ├── people/        # People CRM
│   ├── projects/      # Projects Hub
│   ├── tasks/         # Task Center
│   └── page.tsx       # Activity Feed (home)
├── components/
│   ├── docs/          # DocumentModal
│   ├── people/        # PersonModal
│   ├── projects/      # ProjectModal
│   └── tasks/         # TaskModal
├── data/
│   ├── mission-control.db
│   └── schema.sql
└── lib/
    ├── activity.ts    # Activity feed computation
    ├── db.ts          # Database utilities
    ├── documents.ts   # Document CRUD
    ├── memories.ts    # Memory CRUD
    ├── people.ts      # People CRUD
    ├── projects.ts    # Project CRUD
    ├── tasks.ts       # Task CRUD
    └── types.ts       # TypeScript interfaces
```

## Database

SQLite database at `data/mission-control.db`. Schema includes:
- projects: Long-term work tracking
- tasks: Action items with status/priority
- people: CRM and relationship tracking
- documents: Content and file metadata
- memories: Decisions, insights, context
- Junction tables for relationships

## Note

Mission Control is an internal tool. No auth, no cloud sync, no external integrations. Data lives locally in SQLite.
