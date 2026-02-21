import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const apiKey = process.env.MC_API_KEY
  const path = request.nextUrl.pathname

  // Allow /api/health without authentication
  if (path === '/api/health') {
    return NextResponse.next()
  }

  // Only apply to /api/* routes
  if (!path.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Skip auth for same-origin browser requests (requests with Referer from localhost:3002)
  // This allows fetch() calls from page components to work without the x-api-key header
  const referer = request.headers.get('referer')
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  const isSameOriginRequest = !origin || origin === `http://${host}` || origin === `https://${host}`
  const isLocalBrowserRequest = (referer?.includes('localhost:3002') || origin?.includes('localhost:3002'))
  const isTunnelRequest = (referer?.includes('mc.bobbyalexis.com') || origin?.includes('mc.bobbyalexis.com'))
  
  // Check if this is a curl-like request with external Referer (should still require API key)
  const hasExternalReferer = referer && !referer.includes('localhost:3002') && !referer.includes(host || '')

  // If it's a same-origin request (no Origin header, no external Referer) or from localhost:3002, skip API key check
  if ((isSameOriginRequest && !hasExternalReferer) || isLocalBrowserRequest || isTunnelRequest) {
    return NextResponse.next()
  }

  // Check for API key in header or query parameter (for external/curl requests)
  const headerKey = request.headers.get('x-api-key')
  const queryKey = request.nextUrl.searchParams.get('apiKey')

  const providedKey = headerKey || queryKey

  // Validate API key
  if (!providedKey || providedKey !== apiKey) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
