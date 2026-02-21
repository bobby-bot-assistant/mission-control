import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'mission-control.json')

function loadDb() {
  const content = fs.readFileSync(DB_FILE, 'utf8')
  return JSON.parse(content)
}

function saveDb(db: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
}

export interface KeySignal {
  text: string
  type: string
  source_url?: string
  linked_contact_id?: string
  linked_case?: string
}

export interface Briefing {
  id: string
  date: string
  title: string
  urgency_level: string
  key_signals: KeySignal[]
  bottom_line: string
  full_content: string
  created_at: string
}

export function getAllBriefings(): Briefing[] {
  const db = loadDb()
  const briefings = db.briefings || []
  return briefings.sort((a: Briefing, b: Briefing) => b.date.localeCompare(a.date))
}

export function getBriefingByDate(date: string): Briefing | null {
  const db = loadDb()
  return (db.briefings || []).find((b: Briefing) => b.date === date) || null
}

export function importBriefing(date: string, content: string): Briefing {
  const db = loadDb()
  if (!db.briefings) db.briefings = []

  // Check if briefing for this date already exists
  const existingIdx = db.briefings.findIndex((b: Briefing) => b.date === date)

  // Parse the markdown content
  const briefing = parseBriefingMarkdown(date, content)

  // Try to link contacts
  const people = db.people || []
  briefing.key_signals = briefing.key_signals.map((signal: KeySignal) => {
    for (const person of people) {
      if (signal.text.includes(person.name)) {
        signal.linked_contact_id = person.id
        break
      }
    }
    return signal
  })

  if (existingIdx >= 0) {
    db.briefings[existingIdx] = briefing
  } else {
    db.briefings.push(briefing)
  }

  saveDb(db)
  return briefing
}

function parseBriefingMarkdown(date: string, content: string): Briefing {
  const lines = content.split('\n')

  // Extract title from first heading
  const titleLine = lines.find(l => l.startsWith('# '))
  const title = titleLine ? titleLine.replace(/^#\s+/, '') : `Briefing — ${date}`

  // Determine urgency
  let urgency_level = 'normal'
  if (content.includes('🔴 URGENT')) urgency_level = 'urgent'
  else if (content.includes('⚠️') || content.includes('HIGH')) urgency_level = 'high'

  // Extract key signals from sections
  const key_signals: KeySignal[] = []

  // Get signals from URGENT section
  const urgentMatch = content.match(/## 🔴 URGENT[\s\S]*?(?=\n## |$)/i)
  if (urgentMatch) {
    const subheadings = urgentMatch[0].match(/### (.+)/g)
    if (subheadings) {
      subheadings.forEach(h => {
        key_signals.push({ text: h.replace('### ', ''), type: 'urgent' })
      })
    }
  }

  // Get signals from SIGNALS section
  const signalsMatch = content.match(/## 📡 SIGNALS[\s\S]*?(?=\n## |$)/i)
  if (signalsMatch) {
    const subheadings = signalsMatch[0].match(/### (.+)/g)
    if (subheadings) {
      subheadings.forEach(h => {
        key_signals.push({ text: h.replace('### ', ''), type: 'signal' })
      })
    }
  }

  // Get signals from OPPORTUNITIES section
  const oppsMatch = content.match(/## 💡 OPPORTUNITIES[\s\S]*?(?=\n## |$)/i)
  if (oppsMatch) {
    const subheadings = oppsMatch[0].match(/### (.+)/g)
    if (subheadings) {
      subheadings.forEach(h => {
        key_signals.push({ text: h.replace('### ', ''), type: 'opportunity' })
      })
    }
  }

  // Extract URLs from content for signals
  const urlRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g
  let urlMatch
  const urlMap = new Map<string, string>()
  while ((urlMatch = urlRegex.exec(content)) !== null) {
    urlMap.set(urlMatch[1], urlMatch[2])
  }

  // Attach first relevant URL to each signal
  key_signals.forEach(signal => {
    for (const [, url] of Array.from(urlMap.entries())) {
      signal.source_url = signal.source_url || url
    }
  })

  // Extract bottom line from LANDSCAPE SNAPSHOT
  let bottom_line = ''
  const landscapeMatch = content.match(/## 📊 LANDSCAPE SNAPSHOT[\s\S]*?(?=\n---|\n\*Briefing compiled|$)/i)
  if (landscapeMatch) {
    const paragraphs = landscapeMatch[0].split('\n\n').filter(p => p.trim() && !p.startsWith('##'))
    bottom_line = paragraphs.map(p => p.replace(/\*\*/g, '').replace(/\n/g, ' ').trim()).join(' ').substring(0, 500)
  }

  return {
    id: crypto.randomUUID(),
    date,
    title,
    urgency_level,
    key_signals,
    bottom_line,
    full_content: content,
    created_at: new Date().toISOString()
  }
}
