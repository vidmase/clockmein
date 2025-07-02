'use client'

import { Hero } from '@/components/hero'
import { useAuth } from '@/components/auth/auth-provider'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const lastPath = sessionStorage.getItem('lastPath') || '/dashboard/time'
      router.push(lastPath)
    }
  }, [user, router])

  return (
    <main>
      <Hero />
    </main>
  )
}

