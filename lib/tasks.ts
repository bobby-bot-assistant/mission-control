import { getDb } from './db'
import { Task, TaskStatus, Priority, Subtask } from './types'

export function getAllTasks(): Task[] {
  const db = getDb()
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all() as Record<string, unknown>[]
  return tasks.map(mapTaskRow)
}

export function getTaskById(id: string): Task | null {
  const db = getDb()
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Record<string, unknown> | undefined
  return task ? mapTaskRow(task) : null
}

export function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Task {
  const db = getDb()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  
  db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, due_date, completed_date, notes, subtasks, related_project_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    task.title,
    task.description || null,
    task.status,
    task.priority,
    task.due_date || null,
    task.completed_date || null,
    task.notes ? JSON.stringify(task.notes) : null,
    task.subtasks ? JSON.stringify(task.subtasks) : null,
    task.related_project_id || null
  )
  
  return { ...task, id, created_at: now, updated_at: now }
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const db = getDb()
  const existing = getTaskById(id)
  if (!existing) return null
  
  const fields: string[] = []
  const values: unknown[] = []
  
  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title) }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description) }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status) }
  if (updates.priority !== undefined) { fields.push('priority = ?'); values.push(updates.priority) }
  if (updates.due_date !== undefined) { fields.push('due_date = ?'); values.push(updates.due_date) }
  if (updates.completed_date !== undefined) { fields.push('completed_date = ?'); values.push(updates.completed_date) }
  if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(JSON.stringify(updates.notes)) }
  if (updates.subtasks !== undefined) { fields.push('subtasks = ?'); values.push(JSON.stringify(updates.subtasks)) }
  if (updates.related_project_id !== undefined) { fields.push('related_project_id = ?'); values.push(updates.related_project_id) }
  
  fields.push('updated_at = ?')
  values.push(new Date().toISOString())
  values.push(id)
  
  db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  
  return getTaskById(id)
}

export function deleteTask(id: string): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
  return result.changes > 0
}

export function getTasksByProject(projectId: string): Task[] {
  const db = getDb()
  const tasks = db.prepare('SELECT * FROM tasks WHERE related_project_id = ? ORDER BY created_at DESC')
    .all(projectId) as Record<string, unknown>[]
  return tasks.map(mapTaskRow)
}

export function getTasksByStatus(status: TaskStatus): Task[] {
  const db = getDb()
  const tasks = db.prepare('SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC')
    .all(status) as Record<string, unknown>[]
  return tasks.map(mapTaskRow)
}

export function getUpcomingTasks(days: number = 7): Task[] {
  const db = getDb()
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)
  
  const tasks = db.prepare(`
    SELECT * FROM tasks 
    WHERE due_date IS NOT NULL 
    AND due_date <= ? 
    AND status NOT IN ('✅ Completed', '❌ Cancelled')
    ORDER BY due_date ASC
  `).all(futureDate.toISOString().split('T')[0]) as Record<string, unknown>[]
  
  return tasks.map(mapTaskRow)
}

export function searchTasks(query: string): Task[] {
  const db = getDb()
  const tasks = db.prepare('SELECT * FROM tasks').all() as Record<string, unknown>[]
  const lowerQuery = query.toLowerCase()
  
  return tasks
    .map(mapTaskRow)
    .filter(t => 
      t.title.toLowerCase().includes(lowerQuery) ||
      (t.description && t.description.toLowerCase().includes(lowerQuery)) ||
      t.notes.some(n => n.toLowerCase().includes(lowerQuery))
    )
}

function mapTaskRow(row: Record<string, unknown>): Task {
  // Handle notes - could be JSON array or plain string from old seed data
  let notes: string[] = []
  if (row.notes) {
    try {
      const parsed = JSON.parse(row.notes as string)
      notes = Array.isArray(parsed) ? parsed : [parsed]
    } catch (e) {
      // If JSON parsing fails, treat as plain string
      notes = [row.notes as string]
    }
  }

  // Handle subtasks - should be JSON array
  let subtasks: Subtask[] = []
  if (row.subtasks) {
    try {
      subtasks = JSON.parse(row.subtasks as string)
    } catch (e) {
      // If parsing fails, create empty array
      subtasks = []
    }
  }

  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    status: row.status as TaskStatus,
    priority: row.priority as Priority,
    due_date: row.due_date as string | undefined,
    completed_date: row.completed_date as string | undefined,
    notes,
    subtasks,
    related_project_id: row.related_project_id as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}