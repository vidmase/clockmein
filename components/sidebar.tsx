"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Clock, FileText, Grid2X2, LineChart, FolderKanban, Receipt, FileSpreadsheet, Users, CalendarDays, CalendarClock, ChevronLeft, Settings, LogOut, User2, Building } from 'lucide-react'
import { CalendarSidebar } from "@/components/calendar-sidebar"
import { User as FirebaseUser } from 'firebase/auth'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth/auth-provider"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ExtendedUser extends FirebaseUser {
  user_metadata?: {
    full_name?: string
  }
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth() as { user: ExtendedUser | null, signOut: () => void }

  useEffect(() => {
    // Close mobile sidebar on route change
    setIsMobileOpen(false)
  }, [pathname])

  const navigation = [
    {
      title: "Overview",
      links: [
        { name: "Time Tracker", href: "/dashboard/time", icon: Clock, color: "text-blue-500" },
        { name: "Calendar", href: "/dashboard/calendar", icon: Calendar, color: "text-green-500" }
      ],
    },
    {
      title: "Analytics",
      links: [
        { name: "Reports", href: "/dashboard/reports", icon: LineChart, color: "text-pink-500" }
      ],
    }
  ]

  // Hamburger for mobile
  const Hamburger = (
    <button
      className="md:hidden p-2 focus:outline-none"
      aria-label="Open sidebar"
      onClick={() => setIsMobileOpen(true)}
    >
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
    </button>
  )

  // Overlay drawer for mobile
  const MobileDrawer = (
    <div className={`fixed inset-0 z-50 bg-black/40 ${isMobileOpen ? '' : 'hidden'}`}
      onClick={() => setIsMobileOpen(false)}
    >
      <div
        className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/dashboard/time" className="flex items-center gap-2 font-semibold">
            <Clock className="h-6 w-6 text-primary" />
            <span className="text-lg tracking-tight">Timez</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="flex flex-col gap-6">
            {navigation.map((group) => (
              <div key={group.title}>
                <h4 className="text-xs font-semibold text-muted-foreground px-2 mb-2">
                  {group.title}
                </h4>
                <div className="flex flex-col gap-1">
                  {group.links.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Button
                        key={item.name}
                        asChild
                        variant={isActive ? "secondary" : "ghost"}
                        className="justify-start gap-2"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <Link href={item.href}>
                          <item.icon className={`h-4 w-4 ${item.color}`} />
                          <span>{item.name}</span>
                        </Link>
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Hamburger menu for mobile */}
      <div className="md:hidden fixed top-0 left-0 z-50 bg-white w-full h-14 flex items-center px-4 border-b">
        {Hamburger}
        <span className="ml-4 font-semibold text-lg">Timez</span>
      </div>
      {/* Sidebar for desktop */}
      <div
        className={cn(
          "hidden md:flex flex-col h-screen bg-muted/30 border-r transition-all duration-300",
          isCollapsed ? "w-[80px]" : "w-[280px]",
          className
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link
            href="/dashboard/time"
            className={cn(
              "flex items-center gap-2 font-semibold",
              isCollapsed && "justify-center"
            )}
          >
            <Clock className="h-6 w-6 text-primary" />
            {!isCollapsed && (
              <span className="text-lg tracking-tight">Timez</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                isCollapsed && "rotate-180"
              )}
            />
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="flex flex-col gap-6">
            {navigation.map((group) => (
              <div key={group.title}>
                {!isCollapsed && (
                  <h4 className="text-xs font-semibold text-muted-foreground px-2 mb-2">
                    {group.title}
                  </h4>
                )}
                <div className="flex flex-col gap-1">
                  {group.links.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Button
                        key={item.name}
                        asChild
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "justify-start gap-2",
                          isCollapsed && "justify-center px-2"
                        )}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <Link href={item.href}>
                          <item.icon className={`h-4 w-4 ${item.color}`} />
                          {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  isCollapsed && "justify-center"
                )}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.providerData?.[0]?.photoURL} alt={user?.providerData?.[0]?.displayName} /> {/* Access photo URL from provider data */}
                  <AvatarFallback>{user?.providerData?.[0]?.displayName?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback> {/* Access display name from provider data with type annotation */}
                </Avatar>
                {!isCollapsed && (
                  <>
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">{user?.displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User2 className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Mobile drawer overlay */}
      {MobileDrawer}
    </>
  )
}

