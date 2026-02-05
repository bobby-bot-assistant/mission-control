import { getDb } from './db'
import { Project, ProjectStatus, Priority, Category } from './types'

export function getAllProjects(): Project[] {
  const db = getDb()
  const projects = db.prepare('SELECT * FROM projects ORDER BY last_active DESC').all() as Record<string, unknown>[]
  return projects.map(mapProjectRow)
}

export function getProjectById(id: string): Project | null {
  const db = getDb()
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Record<string, unknown> | undefined
  return project ? mapProjectRow(project) : null
}

export function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Project {
  const db = getDb()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  
  db.prepare(`
    INSERT INTO projects (id, name, codename, vision, status, priority, category, started, target_eta, last_active, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    project.name,
    project.codename || null,
    project.vision,
    project.status,
    project.priority,
    project.category,
    project.started,
    project.target_eta || null,
    project.last_active,
    JSON.stringify(project.tags)
  )
  
  return { ...project, id, created_at: now, updated_at: now }
}

export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const db = getDb()
  const existing = getProjectById(id)
  if (!existing) return null
  
  const fields: string[] = []
  const values: unknown[] = []
  
  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name) }
  if (updates.codename !== undefined) { fields.push('codename = ?'); values.push(updates.codename) }
  if (updates.vision !== undefined) { fields.push('vision = ?'); values.push(updates.vision) }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status) }
  if (updates.priority !== undefined) { fields.push('priority = ?'); values.push(updates.priority) }
  if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category) }
  if (updates.target_eta !== undefined) { fields.push('target_eta = ?'); values.push(updates.target_eta) }
  if (updates.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(updates.tags)) }
  
  // Always update last_active when modifying
  fields.push('last_active = ?')
  values.push(new Date().toISOString())
  
  fields.push('updated_at = ?')
  values.push(new Date().toISOString())
  
  values.push(id)
  
  db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  
  return getProjectById(id)
}

export function deleteProject(id: string): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id)
  return result.changes > 0
}

function mapProjectRow(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    codename: row.codename as string | undefined,
    vision: row.vision as string,
    status: row.status as ProjectStatus,
    priority: row.priority as Priority,
    category: row.category as Category,
    started: row.started as string,
    target_eta: row.target_eta as string | undefined,
    last_active: row.last_active as string,
    tags: row.tags ? JSON.parse(row.tags as string) : [],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}
