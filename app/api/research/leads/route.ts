import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

const LEADS_DATABASE_PATH = '/Users/daisydukes/openclaw-projects/scout/leads-database.json'

export async function GET() {
  try {
    const content = await fs.readFile(LEADS_DATABASE_PATH, 'utf-8')
    const leads = JSON.parse(content)
    
    return NextResponse.json({
      leads,
      count: leads.length,
      source: LEADS_DATABASE_PATH
    })
  } catch (error) {
    console.error('Error reading leads database:', error)
    return NextResponse.json({ 
      error: 'Failed to load leads database',
      details: String(error)
    }, { status: 500 })
  }
}
