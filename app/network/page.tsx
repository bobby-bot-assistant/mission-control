'use client'

import { useRouter } from 'next/navigation'

export default function NetworkPage() {
  const router = useRouter()
  
  // Redirect to existing People page
  router.replace('/people')
  
  return null
}