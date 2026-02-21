import fs from 'fs'
import path from 'path'
import { OutreachDocument } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'mission-control.json')

function readDb(): any {
  const content = fs.readFileSync(DB_FILE, 'utf8')
  const data = JSON.parse(content)
  if (!data.outreach_documents) data.outreach_documents = []
  return data
}

function writeDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

export function getAllDocuments(): OutreachDocument[] {
  const data = readDb()
  return data.outreach_documents
}

export function getDocumentById(id: string): OutreachDocument | null {
  const docs = getAllDocuments()
  return docs.find((d: OutreachDocument) => d.id === id) || null
}

export function createDocument(doc: Omit<OutreachDocument, 'id' | 'created_at' | 'updated_at'>): OutreachDocument {
  const data = readDb()
  const now = new Date().toISOString()
  const newDoc: OutreachDocument = {
    ...doc,
    id: crypto.randomUUID(),
    linked_contacts: doc.linked_contacts || [],
    tags: doc.tags || [],
    created_at: now,
    updated_at: now,
  }
  data.outreach_documents.push(newDoc)
  writeDb(data)
  return newDoc
}

export function updateDocument(id: string, updates: Partial<OutreachDocument>): OutreachDocument | null {
  const data = readDb()
  const index = data.outreach_documents.findIndex((d: OutreachDocument) => d.id === id)
  if (index === -1) return null
  data.outreach_documents[index] = {
    ...data.outreach_documents[index],
    ...updates,
    id, // don't allow id change
    updated_at: new Date().toISOString(),
  }
  writeDb(data)
  return data.outreach_documents[index]
}

export function deleteDocument(id: string): boolean {
  const data = readDb()
  const len = data.outreach_documents.length
  data.outreach_documents = data.outreach_documents.filter((d: OutreachDocument) => d.id !== id)
  if (data.outreach_documents.length === len) return false
  writeDb(data)
  return true
}

export function getDocumentsByContactId(contactId: string): OutreachDocument[] {
  return getAllDocuments().filter((d: OutreachDocument) => d.linked_contacts.includes(contactId))
}

export function linkDocumentToContact(docId: string, contactId: string): OutreachDocument | null {
  const data = readDb()
  const doc = data.outreach_documents.find((d: OutreachDocument) => d.id === docId)
  if (!doc) return null
  if (!doc.linked_contacts.includes(contactId)) {
    doc.linked_contacts.push(contactId)
    doc.updated_at = new Date().toISOString()
    writeDb(data)
  }
  return doc
}

export function unlinkDocumentFromContact(docId: string, contactId: string): OutreachDocument | null {
  const data = readDb()
  const doc = data.outreach_documents.find((d: OutreachDocument) => d.id === docId)
  if (!doc) return null
  doc.linked_contacts = doc.linked_contacts.filter((id: string) => id !== contactId)
  doc.updated_at = new Date().toISOString()
  writeDb(data)
  return doc
}
