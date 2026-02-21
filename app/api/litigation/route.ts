import { NextResponse } from 'next/server'
import { readJSON } from '@/lib/data'
import { dataPath } from '@/lib/config'

export async function GET() {
  try {
    const dataPathVal = dataPath('litigation-data.json')
    const data = await readJSON<any>(dataPathVal)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load litigation data' }, { status: 500 })
  }
}
