'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to Executive Home
    router.replace('/executive')
  }, [router])

  return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <p className="text-zinc-500 dark:text-zinc-400">Redirecting to Executive Home...</p>
    </div>
  )
}