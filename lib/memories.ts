import { getDb } from './db'
import { Memory, MemoryCategory } from './types'

export function getAllMemories(): Memory[] {
  const db = getDb()
  const memories = db.prepare('SELECT * FROM memories ORDER BY memory_date DESC').all() as Record<string, unknown>[]
  return memories.map(mapMemoryRow)
}

export function getMemoryById(id: string): Memory | null {
  const db = getDb()
  const memory = db.prepare('SELECT * FROM memories WHERE id = ?').get(id) as Record<string, unknown> | undefined
  return memory ? mapMemoryRow(memory) : null
}

export function createMemory(memory: Omit<Memory, 'id' | 'created_at'>): Memory {
  const db = getDb()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  
  db.prepare(`
    INSERT INTO memories (id, title, category, content, why_it_matters, memory_date, related_project_id, source, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    memory.title,
    memory.category,
    memory.content,
    memory.why_it_matters || null,
    memory.memory_date,
    memory.related_project_id || null,
    memory.source || null,
    JSON.stringify(memory.tags)
  )
  
  return { ...memory, id, created_at: now }
}

export function updateMemory(id: string, updates: Partial<Memory>): Memory | null {
  const db = getDb()
  const existing = getMemoryById(id)
  if (!existing) return null
  
  const fields: string[] = []
  const values: unknown[] = []
  
  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title) }
  if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category) }
  if (updates.content !== undefined) { fields.push('content = ?'); values.push(updates.content) }
  if (updates.why_it_matters !== undefined) { fields.push('why_it_matters = ?'); values.push(updates.why_it_matters) }
  if (updates.memory_date !== undefined) { fields.push('memory_date = ?'); values.push(updates.memory_date) }
  if (updates.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(updates.tags)) }
  
  values.push(id)
  db.prepare(`UPDATE memories SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  
  return getMemoryById(id)
}

export function deleteMemory(id: string): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM memories WHERE id = ?').run(id)
  return result.changes > 0
}

export function searchMemories(query: string): Memory[] {
  const db = getDb()
  const memories = db.prepare('SELECT * FROM memories').all() as Record<string, unknown>[]
  const lowerQuery = query.toLowerCase()
  
  return memories
    .map(mapMemoryRow)
    .filter(m => 
      m.title.toLowerCase().includes(lowerQuery) ||
      m.content.toLowerCase().includes(lowerQuery) ||
      m.tags.some(t => t.toLowerCase().includes(lowerQuery))
    )
}

function mapMemoryRow(row: Record<string, unknown>): Memory {
  return {
    id: row.id as string,
    title: row.title as string,
    category: row.category as MemoryCategory,
    content: row.content as string,
    why_it_matters: row.why_it_matters as string | undefined,
    memory_date: row.memory_date as string,
    related_project_id: row.related_project_id as string | undefined,
    source: row.source as string | undefined,
    tags: row.tags ? JSON.parse(row.tags as string) : [],
    created_at: row.created_at as string,
  }
}
