'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OpportunitiesPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/pipeline')
  }, [router])
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center">
        <p className="text-foreground-muted">Redirecting to Pipeline...</p>
      </div>
    </div>
  )
}
