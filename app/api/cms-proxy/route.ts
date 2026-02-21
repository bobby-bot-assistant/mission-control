import { NextRequest, NextResponse } from 'next/server'

const CMS_BASE = process.env.CMS_API_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || '/api/cms/jobs'

    const resp = await fetch(`${CMS_BASE}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await resp.json()
    return NextResponse.json(data, { status: resp.status })
  } catch (e: any) {
    return NextResponse.json({ error: `CMS API unreachable: ${e.message}` }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const endpoint = body._endpoint || '/api/cms/ingest'
    delete body._endpoint

    const resp = await fetch(`${CMS_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await resp.json()
    return NextResponse.json(data, { status: resp.status })
  } catch (e: any) {
    return NextResponse.json({ error: `CMS API unreachable: ${e.message}` }, { status: 502 })
  }
}
