"use client"

import { useState, useEffect } from "react"
import { CalendarSidebar } from "@/components/calendar-sidebar"
import { TimeEntries } from "@/components/time-entries"
import { useTimeEntries } from "@/hooks/useTimeEntries"

export function CalendarView() {
  const [entries, setEntries] = useState<any[]>([])
  const { getTimeEntries } = useTimeEntries()

  useEffect(() => {
    const loadEntries = async () => {
      const data = await getTimeEntries()
      setEntries(data || [])
    }
    loadEntries()
  }, [getTimeEntries])

  return (
    <div className="flex gap-6 w-full max-w-6xl mx-auto">
      <div className="bg-white/80 rounded-xl shadow-md p-4 min-w-[320px] max-w-xs flex-shrink-0 border border-slate-100">
        <CalendarSidebar />
      </div>
      <div className="w-px bg-slate-200 self-stretch mx-2 hidden md:block" />
      <div className="flex-1 min-w-0">
        <TimeEntries entries={entries} />
      </div>
    </div>
  )
} 