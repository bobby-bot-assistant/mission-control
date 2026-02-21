import { getDb } from './db'
import { Person, Relationship, OutreachStatus } from './types'

export function getAllPeople(): Person[] {
  const db = getDb()
  const people = db.prepare('SELECT * FROM people ORDER BY name ASC').all() as Record<string, unknown>[]
  return people.map(mapPersonRow)
}

export function getPersonById(id: string): Person | null {
  const db = getDb()
  const person = db.prepare('SELECT * FROM people WHERE id = ?').get(id) as Record<string, unknown> | undefined
  return person ? mapPersonRow(person) : null
}

export function createPerson(person: Omit<Person, 'id' | 'created_at' | 'updated_at'>): Person {
  const db = getDb()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  
  db.prepare(`
    INSERT INTO people (id, name, nickname, relationship, organization, profile_notes, contact_info, last_contact, followup_reminder, tags, outreach_status, cases)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    person.name,
    person.nickname || null,
    person.relationship,
    person.organization || null,
    person.profile_notes || null,
    person.contact_info ? JSON.stringify(person.contact_info) : null,
    person.last_contact || null,
    person.followup_reminder || null,
    JSON.stringify(person.tags),
    person.outreach_status || null,
    person.cases ? JSON.stringify(person.cases) : null
  )
  
  return { ...person, id, created_at: now, updated_at: now }
}

export function updatePerson(id: string, updates: Partial<Person>): Person | null {
  const db = getDb()
  const existing = getPersonById(id)
  if (!existing) return null
  
  const fields: string[] = []
  const values: unknown[] = []
  
  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name) }
  if (updates.nickname !== undefined) { fields.push('nickname = ?'); values.push(updates.nickname) }
  if (updates.relationship !== undefined) { fields.push('relationship = ?'); values.push(updates.relationship) }
  if (updates.organization !== undefined) { fields.push('organization = ?'); values.push(updates.organization) }
  if (updates.profile_notes !== undefined) { fields.push('profile_notes = ?'); values.push(updates.profile_notes) }
  if (updates.contact_info !== undefined) { fields.push('contact_info = ?'); values.push(JSON.stringify(updates.contact_info)) }
  if (updates.last_contact !== undefined) { fields.push('last_contact = ?'); values.push(updates.last_contact) }
  if (updates.followup_reminder !== undefined) { fields.push('followup_reminder = ?'); values.push(updates.followup_reminder) }
  if (updates.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(updates.tags)) }
  if (updates.outreach_status !== undefined) { fields.push('outreach_status = ?'); values.push(updates.outreach_status) }
  if (updates.cases !== undefined) { fields.push('cases = ?'); values.push(JSON.stringify(updates.cases)) }
  if (updates.email_draft !== undefined) { fields.push('email_draft = ?'); values.push(JSON.stringify(updates.email_draft)) }
  
  fields.push('updated_at = ?')
  values.push(new Date().toISOString())
  values.push(id)
  
  db.prepare(`UPDATE people SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  
  return getPersonById(id)
}

export function deletePerson(id: string): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM people WHERE id = ?').run(id)
  return result.changes > 0
}

export function searchPeople(query: string): Person[] {
  const db = getDb()
  const people = db.prepare('SELECT * FROM people').all() as Record<string, unknown>[]
  const lowerQuery = query.toLowerCase()
  
  return people
    .map(mapPersonRow)
    .filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      (p.nickname && p.nickname.toLowerCase().includes(lowerQuery)) ||
      (p.organization && p.organization.toLowerCase().includes(lowerQuery)) ||
      p.tags.some(t => t.toLowerCase().includes(lowerQuery))
    )
}

export function getRecentInteractions(limit: number = 10): Person[] {
  const db = getDb()
  const people = db.prepare('SELECT * FROM people WHERE last_contact IS NOT NULL ORDER BY last_contact DESC LIMIT ?')
    .all(limit) as Record<string, unknown>[]
  return people.map(mapPersonRow)
}

function mapPersonRow(row: Record<string, unknown>): Person {
  return {
    id: row.id as string,
    name: row.name as string,
    nickname: row.nickname as string | undefined,
    relationship: row.relationship as Relationship,
    organization: row.organization as string | undefined,
    profile_notes: row.profile_notes as string | undefined,
    contact_info: row.contact_info ? JSON.parse(row.contact_info as string) : undefined,
    last_contact: row.last_contact as string | undefined,
    followup_reminder: row.followup_reminder as string | undefined,
    tags: row.tags ? JSON.parse(row.tags as string) : [],
    outreach_status: row.outreach_status as OutreachStatus | undefined,
    cases: row.cases ? JSON.parse(row.cases as string) : undefined,
    email_draft: row.email_draft ? JSON.parse(row.email_draft as string) : undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}