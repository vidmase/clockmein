"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, addDays, isToday } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, Briefcase, Clock, FileText, PlusCircle } from "lucide-react"
import { useTimeEntries } from "@/hooks/useTimeEntries"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { calculateHoursFromDuration } from "@/lib/time-calculations"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { TimesheetPDFTemplate } from "@/components/timesheet-pdf-template"
import type { TimeEntry } from "@/types/time-entry"

export function Timesheet() {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const { getTimeEntries } = useTimeEntries()
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    const loadData = async () => {
      try {
        const entriesData: TimeEntry[] = await getTimeEntries()
        setTimeEntries(entriesData)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
  }, [getTimeEntries])

  const getDailyTotal = (date: Date): string => {
    const dayEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return format(entryDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    })
    const totalHours = dayEntries.reduce((total, entry) => {
      return total + calculateHoursFromDuration(entry.duration)
    }, 0)
    return totalHours.toFixed(2)
  }

  function calculateHoursFromDuration(duration: string): number {
    const match = duration.match(/(\d+)h\s*(\d+)?m?/)
    if (!match) return 0
    const hours = parseInt(match[1], 10)
    const minutes = match[2] ? parseInt(match[2], 10) : 0
    return hours + minutes / 60
  }

  function TimeCell({ date, hours }: { date: Date; hours: string }) {
    return (
      <div className="p-4 text-center">
        {hours}h
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => setCurrentWeek(prev => addDays(prev, -7))}>
          <ChevronLeft />
        </button>
        <span className="font-semibold">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </span>
        <button onClick={() => setCurrentWeek(prev => addDays(prev, 7))}>
          <ChevronRight />
        </button>
        <button onClick={() => setCurrentWeek(new Date())} className="ml-2 px-2 py-1 border rounded">
          Today
        </button>
      </div>
      <div className="grid grid-cols-8 bg-slate-100 rounded overflow-hidden">
        <div className="p-4 font-bold">Day</div>
        {weekDates.map(date => (
          <div key={date.toISOString()} className="p-4 font-bold text-center">
            {format(date, 'EEE')}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-8 divide-x">
        <div className="p-4 font-medium">Total Hours</div>
        {weekDates.map(date => (
          <TimeCell key={date.toISOString()} date={date} hours={getDailyTotal(date)} />
        ))}
      </div>
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Entries This Week</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Start</th>
                <th className="border px-2 py-1">End</th>
                <th className="border px-2 py-1">Break</th>
                <th className="border px-2 py-1">Duration</th>
                <th className="border px-2 py-1">Description</th>
              </tr>
            </thead>
            <tbody>
              {timeEntries.filter(entry => {
                const entryDate = new Date(entry.date)
                return entryDate >= weekStart && entryDate <= addDays(weekStart, 6)
              }).map(entry => (
                <tr key={entry.id}>
                  <td className="border px-2 py-1">{format(new Date(entry.date), 'yyyy-MM-dd')}</td>
                  <td className="border px-2 py-1">{entry.start_time}</td>
                  <td className="border px-2 py-1">{entry.end_time}</td>
                  <td className="border px-2 py-1">{entry.break_time} min</td>
                  <td className="border px-2 py-1">{entry.duration}</td>
                  <td className="border px-2 py-1">{entry.description || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

