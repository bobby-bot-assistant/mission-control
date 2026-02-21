import { NextRequest, NextResponse } from 'next/server'
import { readJSON, writeJSON } from '@/lib/data'

interface DesignReview {
  id: string
  page: string
  description: string
  timestamp: string
  agent: string
  status: 'pending' | 'approved' | 'changes-requested'
  beforeScreenshot: string
  afterScreenshot: string
  notes: string
  feedback: string
}

interface DesignLabData {
  reviews: DesignReview[]
}

const FILE = 'design-lab.json'

export async function GET() {
  try {
    const data = await readJSON<DesignLabData>(FILE)
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.reviews || !Array.isArray(body.reviews)) {
      return NextResponse.json({ error: 'Body must contain a "reviews" array' }, { status: 400 })
    }
    await writeJSON(FILE, body)
    return NextResponse.json(body)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status, notes, feedback } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const data = await readJSON<DesignLabData>(FILE)
    const review = data.reviews?.find((r: DesignReview) => r.id === id)
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (status !== undefined) review.status = status
    if (notes !== undefined) review.notes = notes
    if (feedback !== undefined) review.feedback = feedback

    await writeJSON(FILE, data)
    return NextResponse.json(review)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
