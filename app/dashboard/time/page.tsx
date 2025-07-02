'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WorkTimeTracker } from "@/components/work-time-tracker"
import { useAuth } from "@/components/auth/auth-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function TimePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    } else if (user) {
      sessionStorage.setItem('lastPath', '/dashboard/time')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div>
      <WorkTimeTracker />
    </div>
  )
} 