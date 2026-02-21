import { NextResponse } from 'next/server'
import { checkDataIntegrity } from '@/lib/data-integrity'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Basic health info
    const now = new Date().toISOString()
    const health: Record<string, any> = {
      status: 'healthy',
      timestamp: now,
      lastChecked: now,
      uptime: process.uptime(),
      uptimeHours: +(process.uptime() / 3600).toFixed(2),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      port: process.env.PORT || '3002',
      environment: process.env.NODE_ENV || 'development'
    }

    // Check data integrity
    try {
      const integrity = await checkDataIntegrity()
      health.dataIntegrity = {
        passed: integrity.passed,
        errorCount: integrity.errors.length,
        warningCount: integrity.warnings.length
      }
      
      // If data integrity fails, mark as unhealthy
      if (!integrity.passed) {
        health.status = 'degraded'
      }
    } catch (error) {
      health.status = 'degraded'
      health.dataIntegrity = {
        passed: false,
        error: 'Failed to check data integrity'
      }
    }

    return NextResponse.json(health, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}