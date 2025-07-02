'use client'

import { Home, Clock, Users, BarChart2, Settings, LogOut, Calendar, Briefcase, FolderOpen, Building } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth/auth-provider'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const navigation = [
  { name: 'Time Tracker', href: '/dashboard/time', icon: Clock },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart2 }
]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut, user } = useAuth()
  const [openManagement, setOpenManagement] = useState(false)

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard/time" className="font-semibold">
          Timez
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 