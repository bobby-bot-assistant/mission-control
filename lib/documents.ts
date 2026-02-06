import { getDb } from './db'
import { Document, DocumentType } from './types'

export function getAllDocuments(): Document[] {
  const db = getDb()
  const documents = db.prepare('SELECT * FROM documents ORDER BY created_at DESC').all() as Record<string, unknown>[]
  return documents.map(mapDocumentRow)
}

export function getDocumentById(id: string): Document | null {
  const db = getDb()
  const document = db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as Record<string, unknown> | undefined
  return document ? mapDocumentRow(document) : null
}

export function createDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Document {
  const db = getDb()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  
  // Calculate word count if content is provided
  const wordCount = document.content 
    ? document.content.split(/\s+/).filter(w => w.length > 0).length 
    : (document.word_count || 0)
  
  db.prepare(`
    INSERT INTO documents (id, title, type, file_format, content, word_count, summary, source_context, related_project_id, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    document.title,
    document.type,
    document.file_format || null,
    document.content || null,
    wordCount,
    document.summary || null,
    document.source_context || null,
    document.related_project_id || null,
    JSON.stringify(document.tags)
  )
  
  return { ...document, id, word_count: wordCount, created_at: now, updated_at: now }
}

export function updateDocument(id: string, updates: Partial<Document>): Document | null {
  const db = getDb()
  const existing = getDocumentById(id)
  if (!existing) return null
  
  const fields: string[] = []
  const values: unknown[] = []
  
  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title) }
  if (updates.type !== undefined) { fields.push('type = ?'); values.push(updates.type) }
  if (updates.file_format !== undefined) { fields.push('file_format = ?'); values.push(updates.file_format) }
  if (updates.content !== undefined) { fields.push('content = ?'); values.push(updates.content) }
  if (updates.word_count !== undefined) { fields.push('word_count = ?'); values.push(updates.word_count) }
  if (updates.summary !== undefined) { fields.push('summary = ?'); values.push(updates.summary) }
  if (updates.source_context !== undefined) { fields.push('source_context = ?'); values.push(updates.source_context) }
  if (updates.related_project_id !== undefined) { fields.push('related_project_id = ?'); values.push(updates.related_project_id) }
  if (updates.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(updates.tags)) }
  
  fields.push('updated_at = ?')
  values.push(new Date().toISOString())
  values.push(id)
  
  db.prepare(`UPDATE documents SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  
  return getDocumentById(id)
}

export function deleteDocument(id: string): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM documents WHERE id = ?').run(id)
  return result.changes > 0
}

export function searchDocuments(query: string): Document[] {
  const db = getDb()
  const documents = db.prepare('SELECT * FROM documents').all() as Record<string, unknown>[]
  const lowerQuery = query.toLowerCase()
  
  return documents
    .map(mapDocumentRow)
    .filter(d => 
      d.title.toLowerCase().includes(lowerQuery) ||
      (d.content && d.content.toLowerCase().includes(lowerQuery)) ||
      (d.summary && d.summary.toLowerCase().includes(lowerQuery)) ||
      d.tags.some(t => t.toLowerCase().includes(lowerQuery))
    )
}

export function getDocumentsByProject(projectId: string): Document[] {
  const db = getDb()
  const documents = db.prepare('SELECT * FROM documents WHERE related_project_id = ? ORDER BY created_at DESC')
    .all(projectId) as Record<string, unknown>[]
  return documents.map(mapDocumentRow)
}

export function getDocumentsByType(type: DocumentType): Document[] {
  const db = getDb()
  const documents = db.prepare('SELECT * FROM documents WHERE type = ? ORDER BY created_at DESC')
    .all(type) as Record<string, unknown>[]
  return documents.map(mapDocumentRow)
}

export function getRecentDocuments(limit: number = 10): Document[] {
  const db = getDb()
  const documents = db.prepare('SELECT * FROM documents ORDER BY created_at DESC LIMIT ?')
    .all(limit) as Record<string, unknown>[]
  return documents.map(mapDocumentRow)
}

export function autoCaptureDocument(content: string, context?: string): Document {
  // Auto-capture a document from chat or other source
  // Extract title from first line or content
  const lines = content.trim().split('\n')
  const title = lines[0].slice(0, 100) || 'Untitled Document'
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length
  
  // Determine document type based on content
  let type: DocumentType = '📝 Note / Scratchpad'
  if (content.includes('#') || content.includes('## ')) {
    type = '📝 Note / Scratchpad' // Has markdown headings
  } else if (content.length > 500) {
    type = '📄 Document / Report'
  } else if (content.toLowerCase().includes('todo') || content.toLowerCase().includes('task')) {
    type = '🎯 Strategy / Plan'
  }
  
  return createDocument({
    title,
    type,
    content,
    word_count: wordCount,
    summary: lines.slice(0, 3).join(' ').slice(0, 200),
    source_context: context || 'Auto-captured',
    tags: ['auto-captured'],
  })
}

function mapDocumentRow(row: Record<string, unknown>): Document {
  return {
    id: row.id as string,
    title: row.title as string,
    type: row.type as DocumentType,
    file_format: row.file_format as string | undefined,
    content: row.content as string | undefined,
    word_count: row.word_count as number,
    summary: row.summary as string | undefined,
    source_context: row.source_context as string | undefined,
    related_project_id: row.related_project_id as string | undefined,
    tags: row.tags ? JSON.parse(row.tags as string) : [],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}