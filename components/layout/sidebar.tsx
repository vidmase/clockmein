'use client'

import { Home, Clock, Users, BarChart2, Settings, LogOut, Calendar, Briefcase, FolderOpen, Building } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth/auth-provider'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const navigation = [
  { name: 'Time Tracking', href: '/dashboard/time', icon: Clock },
  { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart2 },
  { 
    name: 'Management',
    icon: FolderOpen,
    children: [
      { name: 'Clients', href: '/dashboard/clients', icon: Users },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ]
  }
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
          if (item.children) {
            return (
              <div key={item.name}>
                <button
                  onClick={() => setOpenManagement(!openManagement)}
                  className={cn(
                    "w-full flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  <ChevronDown className={cn(
                    "ml-auto h-4 w-4 transition-transform",
                    openManagement && "transform rotate-180"
                  )} />
                </button>
                {openManagement && (
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                            isActive
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          )}
                        >
                          <child.icon className="mr-3 h-5 w-5" />
                          {child.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

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