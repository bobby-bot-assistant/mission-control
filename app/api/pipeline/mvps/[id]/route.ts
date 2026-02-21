import { NextRequest, NextResponse } from 'next/server'
import { readJSON } from '@/lib/data'

interface MVPDetail {
  id: string
  title: string
  stage: string
  progress: number
  liveUrl?: string
  features: Array<{
    name: string
    status: string
    priority: string
    builtBy: string
    note?: string
  }>
  blockers: Array<{
    title: string
    owner: string
    description: string
  }>
  nextUp: string[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const mvp = await readJSON<MVPDetail>(`pipeline/mvps/${id}.json`)
    
    if (!mvp || !mvp.id) {
      return NextResponse.json({ error: 'MVP not found' }, { status: 404 })
    }
    
    return NextResponse.json(mvp)
  } catch (error) {
    console.error('Error loading MVP:', error)
    return NextResponse.json({ error: 'MVP not found' }, { status: 404 })
  }
}
