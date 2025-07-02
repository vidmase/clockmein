'use client'

import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/layout/header'
import { useAuth } from '@/components/auth/auth-provider'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      // Store current path in sessionStorage
      sessionStorage.setItem('lastPath', pathname)
    }
  }, [user, loading, router, pathname])

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
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {children}
        </main>
      </div>
    </div>
  )
} 