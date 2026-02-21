import { NextRequest, NextResponse } from 'next/server'

const CMS_BASE = 'http://localhost:3001/api/cms'

export async function POST(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { jobId } = await params as any
    const resp = await fetch(`${CMS_BASE}/jobs/${jobId}/suggest-cuepoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await resp.json()
    return NextResponse.json(data, { status: resp.status })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}
