import { NextResponse } from 'next/server'
import { checkDataIntegrity } from '@/lib/data-integrity'

export async function GET() {
  try {
    const result = await checkDataIntegrity()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Integrity check failed:', error)
    return NextResponse.json({
      passed: false,
      errors: ['Failed to perform integrity check'],
      warnings: []
    })
  }
}