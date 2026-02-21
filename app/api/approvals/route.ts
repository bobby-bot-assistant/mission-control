import { NextRequest, NextResponse } from 'next/server'
import { getAllApprovals, createApproval, updateApproval, deleteApproval } from '@/lib/approvals'

export async function GET() {
  return NextResponse.json(getAllApprovals())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Validate required fields
  if (!body.title || body.title.trim() === '') {
    return NextResponse.json(
      { error: 'title is required' },
      { status: 400 }
    )
  }
  
  const approval = createApproval(body)
  return NextResponse.json(approval)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const updated = updateApproval(id, updates)
  if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  deleteApproval(id)
  return NextResponse.json({ success: true })
}
