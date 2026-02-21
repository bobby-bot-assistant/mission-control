import { NextRequest, NextResponse } from 'next/server'

const CMS_BASE = 'http://localhost:3001/api/cms'

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status') || ''
    const url = status ? `${CMS_BASE}/jobs?status=${status}` : `${CMS_BASE}/jobs`
    const resp = await fetch(url, { cache: 'no-store' })
    const data = await resp.json()
    return NextResponse.json(data, { status: resp.status })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}
