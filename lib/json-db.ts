import fs from 'fs'
import path from 'path'
import { DATA_ROOT } from './config'

// Simple JSON-based database replacement for better-sqlite3
// Works on all Node versions without native dependencies
// IMPORTANT: Uses DATA_ROOT from config.ts — never process.cwd()/data/

const DATA_DIR = DATA_ROOT
const DB_FILE = path.join(DATA_DIR, 'mission-control.json')

interface Database {
  [key: string]: any[]
  projects: any[]
  documents: any[]
  people: any[]
  memories: any[]
  tasks: any[]
  project_people: any[]
  memory_people: any[]
  opportunities: any[]
  outreach_documents: any[]
  briefings: any[]
  approvals: any[]
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create data directory:', error)
  }
}

// Initialize empty database if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  const emptyDb: Database = {
    projects: [],
    documents: [],
    people: [],
    memories: [],
    tasks: [],
    project_people: [],
    memory_people: [],
    opportunities: [],
    outreach_documents: [],
    briefings: [],
    approvals: []
  }
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(emptyDb, null, 2))
    console.log('Created initial database file:', DB_FILE)
  } catch (error) {
    console.error('Failed to write initial database file:', error)
  }
}

class JsonDatabase {
  private data!: Database

  constructor() {
    this.load()
  }

  private load() {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8')
      this.data = JSON.parse(content)
      if (!this.data.opportunities) {
        this.data.opportunities = []
      }
      if (!this.data.outreach_documents) {
        this.data.outreach_documents = []
      }
      if (!this.data.briefings) {
        this.data.briefings = []
      }
      if (!this.data.approvals) {
        this.data.approvals = []
      }
      this.save()
    } catch (error) {
      console.error('Error loading database:', error)
      this.data = {
        projects: [],
        documents: [],
        people: [],
        memories: [],
        tasks: [],
        project_people: [],
        memory_people: [],
        opportunities: [],
        outreach_documents: [],
        briefings: [],
        approvals: []
      }
      this.save()
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2))
    } catch (error) {
      console.error('Error saving database:', error)
    }
  }

  // Mimic better-sqlite3 prepare().all() pattern
  prepare(query: string) {
    console.log('Executing query:', query)
    const cleanQuery = query.trim()
    return {
      get: (...args: any[]) => {
        const match = cleanQuery.match(/SELECT \* FROM (\w+) WHERE (\w+) = \?/i)
        if (match) {
          const [, table, field] = match
          const value = args[0]
          return (this.data[table] || []).find((item: any) => item[field] === value) || undefined
        }
        // Fallback: return first from all()
        const results = this.prepare(query).all(...args)
        return results[0] || undefined
      },
      all: (params?: any) => {
        console.log('All query params:', params)
        
        // Simple SELECT * FROM table_name parsing
        const match = cleanQuery.match(/SELECT \* FROM (\w+)/i)
        if (match) {
          const table = match[1]
          console.log('Fetching table:', table)
          return this.data[table] || []
        }
        
        // Handle WHERE clauses for opportunities
        const whereMatch = cleanQuery.match(/SELECT \* FROM (\w+) WHERE (\w+) = \?/i)
        if (whereMatch) {
          const [, table, field] = whereMatch
          console.log(`Filtering ${table} where ${field} = ${params}`)
          return this.data[table]?.filter(item => item[field] === params) || []
        }
        
        // Return empty array for other queries
        return []
      },
      run: (...args: any[]) => {
        // Handle UPDATE table SET field1 = ?, field2 = ? WHERE id = ?
        if (cleanQuery.includes('UPDATE')) {
          const tableMatch = cleanQuery.match(/UPDATE (\w+) SET/i)
          const setMatch = cleanQuery.match(/SET (.+?) WHERE/i)
          const whereMatch = cleanQuery.match(/WHERE (\w+) = \?/i)
          if (tableMatch && setMatch && whereMatch) {
            const table = tableMatch[1]
            const setParts = setMatch[1].split(',').map(s => s.trim().split('=')[0].trim())
            const whereField = whereMatch[1]
            // args are positional: set values..., then where value
            const whereValue = args[setParts.length]
            const items = this.data[table] || []
            const idx = items.findIndex((item: any) => item[whereField] === whereValue)
            if (idx >= 0) {
              setParts.forEach((field, i) => {
                items[idx][field] = args[i]
              })
              this.save()
              return { changes: 1 }
            }
            return { changes: 0 }
          }
        }
        
        // Handle INSERT
        if (cleanQuery.includes('INSERT INTO')) {
          // Handle multiline queries by removing newlines within the statement
          const normalizedQuery = cleanQuery.replace(/\s+/g, ' ')
          const match = normalizedQuery.match(/INSERT INTO (\w+) \((.*?)\) VALUES/i)
          if (match) {
            const table = match[1]
            const fields = match[2].split(',').map(f => f.trim())
            const newItem: any = {}
            fields.forEach((field, index) => {
              newItem[field] = args[index]
            })
            newItem.created_at = new Date().toISOString()
            newItem.updated_at = new Date().toISOString()
            this.data[table] = this.data[table] || []
            this.data[table].push(newItem)
            this.save()
          }
        }
        
        // Handle DELETE with WHERE
        if (cleanQuery.includes('DELETE FROM')) {
          const match = cleanQuery.match(/DELETE FROM (\w+) WHERE (\w+) = \?/i)
          if (match) {
            const [, table, field] = match
            const value = args[0]
            const items = this.data[table] || []
            const before = items.length
            this.data[table] = items.filter((item: any) => item[field] !== value)
            this.save()
            return { changes: before - this.data[table].length }
          }
          // DELETE without WHERE (clear all)
          const clearMatch = cleanQuery.match(/DELETE FROM (\w+)/i)
          if (clearMatch) {
            this.data[clearMatch[1]] = []
            this.save()
          }
        }
        
        return { changes: 1 }
      }
    }
  }

  close() {
    // No-op for compatibility
  }

  pragma() {
    // No-op for compatibility
  }

  exec(schema: string) {
    // No-op - we don't need schema for JSON storage
    console.log('Schema exec called (no-op for JSON storage)')
  }
}

// Export a singleton instance
let db: JsonDatabase | null = null

export function getDb(): JsonDatabase {
  if (!db) {
    db = new JsonDatabase()
  }
  return db as any // Cast to any for compatibility
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}

// Default export for compatibility
export default JsonDatabase