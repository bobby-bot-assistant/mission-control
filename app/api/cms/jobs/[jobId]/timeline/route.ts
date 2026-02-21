import { NextRequest, NextResponse } from 'next/server'

const CMS_BASE = 'http://localhost:3001/api/cms'

export async function GET(_req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { jobId } = await params as any
    const resp = await fetch(`${CMS_BASE}/jobs/${jobId}/timeline`, { cache: 'no-store' })
    const data = await resp.json()
    return NextResponse.json(data, { status: resp.status })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}
