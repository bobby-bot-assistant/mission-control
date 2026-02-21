import { NextResponse } from 'next/server'
import { createDocument, getAllDocuments } from '@/lib/outreach-documents'
import { getAllPeople } from '@/lib/people'
import fs from 'fs/promises'
import path from 'path'

export async function POST() {
  try {
    const existing = getAllDocuments()
    if (existing.length > 0) {
      return NextResponse.json({ message: 'Documents already seeded', count: existing.length })
    }

    const assetsDir = path.join(process.cwd(), '..', 'mission-control-data', 'outreach-assets')
    
    try {
      await fs.access(assetsDir)
    } catch {
      return NextResponse.json({ error: 'Outreach assets directory not found' }, { status: 404 })
    }

    // Get cy-pres contact IDs
    const people = getAllPeople()
    const cyPresContacts = people.filter(p => p.tags.includes('cy-pres-outreach')).map(p => p.id)

    const files = (await fs.readdir(assetsDir)).filter(f => f.endsWith('.md') && f !== 'README.md')
    const created = []

    for (const file of files) {
      const content = await fs.readFile(path.join(assetsDir, file), 'utf8')
      const title = content.split('\n')[0]?.replace(/^#\s*/, '') || file

      let category: any = 'outreach-asset'
      if (file.includes('email-template')) category = 'email-template'
      else if (file.includes('executive-summary')) category = 'executive-summary'
      else if (file.includes('use-of-funds')) category = 'legal-document'

      // Link email template to all cy-pres contacts, others get linked too
      const linked = file.includes('email-template') ? cyPresContacts : cyPresContacts

      const doc = createDocument({
        title,
        filename: file,
        mime_type: 'text/markdown',
        content,
        category,
        linked_contacts: linked,
        tags: ['cy-pres', 'outreach'],
      })
      created.push(doc)
    }

    return NextResponse.json({ message: `Seeded ${created.length} documents`, documents: created })
  } catch (error) {
    console.error('Error seeding:', error)
    return NextResponse.json({ error: 'Failed to seed documents' }, { status: 500 })
  }
}
