"use client"

import { useState, useEffect, useMemo } from "react"
import { useTimeEntries } from "@/hooks/useTimeEntries"
import { useAuth } from "@/components/auth/auth-provider"
import { Clock, Plus, Briefcase, Target, Coffee, TrendingUp, Pencil, Trash2, Calendar, AlertCircle, Settings2, CalendarDays, History, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { 
  getWeekBoundaries,
  calculateWeeklyHours,
  calculateLastMonthHours,
  calculateCurrentMonthHours,
  formatHoursAndMinutes
} from "@/lib/time-calculations"
import { CalendarSidebar } from "@/components/calendar-sidebar"
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns'
import { cn } from "@/lib/utils"
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { DateRange } from "@/lib/time-calculations"
import { Pagination } from "@/components/ui/pagination"
import { PDFDateSelectionDialog } from "@/components/pdf-date-selection-dialog"


interface TimeEntry {
  id: string
  user_id: string
  date: string
  start_time: string
  end_time: string
  description: string
  duration: string
  break_time: number
  project_id?: string
  project?: {
    id: string
    name: string
    client: string
    color: string
  }
  tags?: string[]
  status?: 'active' | 'completed'
}

const timeEntrySchema = z.object({
  date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  break_time: z.string().default("0"),
  description: z.string().optional(),
})

export function WorkTimeTracker() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const { user } = useAuth()
  const { addTimeEntry, getTimeEntries, updateTimeEntry, deleteTimeEntry } = useTimeEntries()
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const entriesPerPage = 7
  const [selectedRangeHours, setSelectedRangeHours] = useState(0)
  const [isPDFDialogOpen, setIsPDFDialogOpen] = useState(false)

  const today = new Date()
  const weekStart = new Date(today)
  const dayOfWeek = today.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  weekStart.setDate(today.getDate() + diff)
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  
  const lastWeekStart = new Date(weekStart)
  lastWeekStart.setDate(weekStart.getDate() - 7)
  
  const lastWeekEnd = new Date(weekEnd)
  lastWeekEnd.setDate(weekEnd.getDate() - 7)
  
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)

  const filteredEntries = useMemo(() => {
    if (!dateRange?.from) return timeEntries
    
    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      if (dateRange.to) {
        return isWithinInterval(entryDate, { start: dateRange.from, end: dateRange.to })
      }
      return format(entryDate, 'yyyy-MM-dd') === format(dateRange.from, 'yyyy-MM-dd')
    })
  }, [timeEntries, dateRange])

    const totalPages = Math.max(1, Math.ceil(filteredEntries.length / entriesPerPage))

  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage
    return filteredEntries.slice(startIndex, startIndex + entriesPerPage)
  }, [filteredEntries, currentPage])
  

  const form = useForm({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      description: "",
      start_time: "06:00",
      end_time: "",
      break_time: "45",
    },
  })

  useEffect(() => {
    loadTimeEntries()
  }, [])

  useEffect(() => {
    const hours = calculateSelectedRangeHours(filteredEntries, dateRange)
    setSelectedRangeHours(parseFloat(hours.toFixed(1)))
  }, [filteredEntries, dateRange])

  const loadTimeEntries = async () => {
    try {
      const entries = await getTimeEntries()
      setTimeEntries(entries)
    } catch (error) {
      toast.error("Failed to load time entries")
    }
  }

  const calculateDuration = (startTime: string, endTime: string, breakTime: string) => {
    const start = new Date(`2000/01/01 ${startTime}`)
    const end = new Date(`2000/01/01 ${endTime}`)
    const diff = (end.getTime() - start.getTime()) / 1000 / 60 // Get difference in minutes
    const breakMinutes = parseInt(breakTime) || 0
    const totalMinutes = diff - breakMinutes // Subtract break time
    
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round(totalMinutes % 60)
    return `${hours}h ${minutes}m`
  }

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry)
    form.reset({
      date: entry.date,
      start_time: entry.start_time,
      end_time: entry.end_time,
      break_time: entry.break_time.toString(),
      description: entry.description,
    })
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: z.infer<typeof timeEntrySchema>) => {
    try {
      const duration = calculateDuration(data.start_time, data.end_time, parseInt(data.break_time))
      
      const entryData = {
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        break_time: parseInt(data.break_time),
        description: data.description || '',
        duration: duration,
        user_id: user?.id,
        project_id: data.project_id
      }

      const response = await fetch('/api/timez', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Failed to add time entry')
      }

      const newEntry = await response.json()
      setTimeEntries(prev => [newEntry, ...prev])
      setIsDialogOpen(false)
      form.reset()
      toast.success("Time entry added successfully")
    } catch (error: any) {
      console.error('Error submitting time entry:', error)
      toast.error(error.message || "Failed to add time entry")
    }
  }

  const calculateTotalHours = (entries: TimeEntry[]) => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= weekStart
    })

    return weekEntries.reduce((total, entry) => {
      const [hours, minutesPart] = entry.duration.split('h ')
      const minutes = parseInt(minutesPart.replace('m', ''))
      const totalMinutes = (parseInt(hours) * 60) + minutes
      const breakTime = entry.break_time || 0
      return total + ((totalMinutes - breakTime) / 60)
    }, 0)
  }

  const calculateDailyAverage = (entries: TimeEntry[]) => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= weekStart
    })

    if (weekEntries.length === 0) return 0

    const totalHours = weekEntries.reduce((total, entry) => {
      const [hours, minutesPart] = entry.duration.split('h ')
      const minutes = parseInt(minutesPart.replace('m', ''))
      const totalMinutes = (parseInt(hours) * 60) + minutes
      
      const breakTime = entry.break_time || 0
      return total + ((totalMinutes - breakTime) / 60)
    }, 0)

    const uniqueDays = new Set(weekEntries.map(entry => entry.date)).size
    return uniqueDays > 0 ? Number((totalHours / uniqueDays).toFixed(2)) : 0
  }

  const getEntriesThisWeek = () => {
    const { monday, sunday } = getWeekBoundaries(new Date())
    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= monday && entryDate <= sunday
    })
  }

  const calculateWeeklyHours = (entries: TimeEntry[]) => {
    const today = new Date()
    const monday = new Date(today)
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    monday.setDate(today.getDate() + diff)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= monday && entryDate <= sunday
    })

    const totalHours = weekEntries.reduce((total, entry) => {
      const [hours, minutesPart] = entry.duration.split('h ')
      const minutes = parseInt(minutesPart.replace('m', ''))
      return total + (parseInt(hours) + minutes / 60)
    }, 0)

    return totalHours.toFixed(2)
  }

  const calculateWeeklyProgress = (entries: TimeEntry[]) => {
    const weeklyGoal = 40 // Assuming a weekly goal of 40 hours
    const weeklyHours = calculateWeeklyHours(entries)
    return (weeklyHours / weeklyGoal) * 100
  }

  const calculateRemainingHours = (entries: TimeEntry[]) => {
    const weeklyGoal = 40 // Assuming a weekly goal of 40 hours
    const weeklyHours = calculateWeeklyHours(entries)
    const remainingHours = weeklyGoal - weeklyHours
    return remainingHours.toFixed(2)
  }

  const getCurrentProject = (entries: TimeEntry[]) => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= weekStart
    })

    const projects = new Set(weekEntries.map(entry => entry.description))
    return projects.size > 0 ? Array.from(projects)[0] : null
  }

  const getProjectDuration = (entries: TimeEntry[]) => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= weekStart
    })

    const projectDuration = weekEntries.reduce((total, entry) => {
      const [hours, minutesPart] = entry.duration.split('h ')
      const minutes = parseInt(minutesPart.replace('m', ''))
      const totalMinutes = (parseInt(hours) * 60) + minutes
      
      const breakTime = entry.break_time || 0
      return total + ((totalMinutes - breakTime) / 60)
    }, 0)

    return projectDuration.toFixed(2)
  }

  const calculateProductivityScore = (entries: TimeEntry[]) => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= weekStart
    })

    if (weekEntries.length === 0) return 0

    // Calculate total work minutes (excluding breaks)
    const totalWorkMinutes = weekEntries.reduce((total, entry) => {
      const [hours, minutesPart] = entry.duration.split('h ')
      const minutes = parseInt(minutesPart.replace('m', ''))
      return total + (parseInt(hours) * 60) + minutes
    }, 0)

    // Calculate total break minutes
    const totalBreakMinutes = weekEntries.reduce((total, entry) => {
      return total + (entry.break_time || 0)
    }, 0)

    // Calculate effective work time (total - breaks)
    const effectiveWorkMinutes = totalWorkMinutes - totalBreakMinutes

    // Calculate target work minutes (8 hours per workday)
    const workDays = new Set(weekEntries.map(entry => entry.date)).size
    const targetMinutes = workDays * 8 * 60

    // Calculate productivity score based on effective work vs target
    const productivityScore = (effectiveWorkMinutes / targetMinutes) * 100
    
    // Cap at 100% and ensure positive
    return Math.min(Math.max(productivityScore, 0), 100).toFixed(2)
  }

  const calculateNextBreak = (entries: TimeEntry[]) => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= weekStart
    })

    const totalWorkDuration = weekEntries.reduce((total, entry) => {
      const [hours, minutesPart] = entry.duration.split('h ')
      const minutes = parseInt(minutesPart.replace('m', ''))
      const totalMinutes = (parseInt(hours) * 60) + minutes
      
      const breakTime = entry.break_time || 0
      return total + ((totalMinutes - breakTime) / 60)
    }, 0)

    const totalBreakDuration = weekEntries.reduce((total, entry) => {
      const breakTime = entry.break_time || 0
      return total + breakTime
    }, 0)

    const nextBreakDuration = totalBreakDuration - totalWorkDuration
    const nextBreakTime = new Date(today)
    nextBreakTime.setSeconds(nextBreakTime.getSeconds() + nextBreakDuration)

    return nextBreakTime.toISOString().split('T')[1]
  }

  const calculateBreakProgress = (entries: TimeEntry[]) => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= weekStart
    })

    const totalWorkDuration = weekEntries.reduce((total, entry) => {
      const [hours, minutesPart] = entry.duration.split('h ')
      const minutes = parseInt(minutesPart.replace('m', ''))
      const totalMinutes = (parseInt(hours) * 60) + minutes
      
      const breakTime = entry.break_time || 0
      return total + ((totalMinutes - breakTime) / 60)
    }, 0)

    const totalBreakDuration = weekEntries.reduce((total, entry) => {
      const breakTime = entry.break_time || 0
      return total + breakTime
    }, 0)

    const breakProgress = (totalBreakDuration / totalWorkDuration) * 100
    return breakProgress.toFixed(2)
  }

  const calculateTodayHours = (entries: TimeEntry[]) => {
    const today = new Date().toISOString().split('T')[0]
    const todayEntries = entries.filter(entry => entry.date === today)
    
    return todayEntries.reduce((total, entry) => {
      const [hours, minutesPart] = entry.duration.split('h ')
      const minutes = parseInt(minutesPart.replace('m', ''))
      const totalMinutes = (parseInt(hours) * 60) + minutes
      
      const breakTime = entry.break_time || 0
      return total + ((totalMinutes - breakTime) / 60)
    }, 0).toFixed(2)
  } // Calculate hours worked today

  const calculateDailyProgress = (entries: TimeEntry[]) => {
    const dailyGoal = 8 // Standard 8-hour workday
    const todayHours = calculateTodayHours(entries)
    return Math.min((parseFloat(todayHours) / dailyGoal) * 100, 100)
  } // Calculate progress towards daily goal

  const handleDeleteClick = (entry: TimeEntry) => {
    setEntryToDelete(entry)
  }

  const handleDeleteConfirm = async () => {
    if (entryToDelete) {
      await handleDelete(entryToDelete)
      setEntryToDelete(null)
    }
  }

  const handleDelete = async (entry: TimeEntry) => {
    try {
      await deleteTimeEntry(entry.id)
      await loadTimeEntries()
      toast.success("Time entry deleted successfully")
    } catch (error) {
      toast.error("Failed to delete time entry")
    }
  }

  const calculateLastWeekHours = (entries: TimeEntry[]) => {
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    const { monday, sunday } = getWeekBoundaries(lastWeek)

    const lastWeekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= monday && entryDate <= sunday
    })

    const totalMinutes = lastWeekEntries.reduce((total, entry) => {
      const start = new Date(`2000/01/01 ${entry.start_time}`)
      const end = new Date(`2000/01/01 ${entry.end_time}`)
      const diff = (end.getTime() - start.getTime()) / 1000 / 60
      const breakTime = entry.break_time || 0
      return total + (diff - breakTime)
    }, 0)

    return (totalMinutes / 60).toFixed(2)
  }

  const getLastWeekDateRange = () => {
    const today = new Date()
    const lastWeekStart = new Date(today)
    const lastWeekEnd = new Date(today)
    
    lastWeekStart.setDate(today.getDate() - today.getDay() - 6)
    lastWeekEnd.setDate(today.getDate() - today.getDay() - 0)
    
    return `${format(lastWeekStart, 'MMM d')} - ${format(lastWeekEnd, 'MMM d')}`
  }

  const getWorkingDaysLastWeek = () => {
    const today = new Date()
    const lastWeekStart = new Date(today)
    const lastWeekEnd = new Date(today)
    
    lastWeekStart.setDate(today.getDate() - today.getDay() - 7)
    lastWeekEnd.setDate(today.getDate() - today.getDay() - 1)
    
    let count = 0
    const current = new Date(lastWeekStart)
    
    while (current <= lastWeekEnd) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++
      }
      current.setDate(current.getDate() + 1)
    }
    
    return count
  }

  const getThisWeekDateRange = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
    }

    const today = new Date()
    const weekStart = new Date(today)
    const weekEnd = new Date(today)
    
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Adjust to get Monday
    
    weekStart.setDate(today.getDate() + diff)
    weekEnd.setDate(weekStart.getDate() + 6)
    
    return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`
  } //Comment: Calculate week range from Monday to Sunday

  const calculateDateRangeStats = (entries: TimeEntry[], from: Date, to: Date) => {
    const rangeEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return isWithinInterval(entryDate, {
        start: startOfDay(from),
        end: endOfDay(to)
      })
    })

    const totalHours = rangeEntries.reduce((total, entry) => {
      const [hours, minutesPart] = entry.duration.split('h ')
      const minutes = parseInt(minutesPart.replace('m', ''))
      const totalMinutes = (parseInt(hours) * 60) + minutes
      const breakTime = entry.break_time || 0
      return total + ((totalMinutes - breakTime) / 60)
    }, 0)

    const uniqueDays = new Set(rangeEntries.map(entry => entry.date)).size
    const workingDays = getWorkingDaysInRange(from, to)
    
    return {
      totalHours: totalHours.toFixed(2),
      dailyAverage: uniqueDays > 0 ? (totalHours / uniqueDays).toFixed(2) : '0',
      completionRate: (totalHours / (workingDays * 8) * 100).toFixed(2),
      totalEntries: rangeEntries.length,
      workingDays
    }
  }

  const getWorkingDaysInRange = (start: Date, end: Date) => {
    let count = 0
    let current = startOfDay(start)
    const endDate = endOfDay(end)
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++
      }
      current.setDate(current.getDate() + 1)
    }
    
    return count
  }

  const calculateCurrentMonthHours = (entries: TimeEntry[]) => {
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= monthStart && entryDate <= monthEnd
    })

    return monthEntries.reduce((total, entry) => {
      const [hours, minutesPart] = entry.duration.split('h ')
      const minutes = parseInt(minutesPart.replace('m', ''))
      return total + (parseInt(hours) + minutes / 60)
    }, 0).toFixed(2)
  }

  const getWorkingDaysInCurrentMonth = () => {
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    let count = 0
    const current = new Date(monthStart)
    
    while (current <= monthEnd) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++
      }
      current.setDate(current.getDate() + 1)
    }
    
    return count
  }

  const getCurrentMonthDateRange = () => {
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return `${format(monthStart, 'MMM d')} - ${format(monthEnd, 'MMM d')}`
  }

  const calculateLastMonthHours = (entries: TimeEntry[]) => {
    const today = new Date()
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= lastMonthStart && entryDate <= lastMonthEnd
    })

    return monthEntries.reduce((total, entry) => {
      const [hours, minutesPart] = entry.duration.split('h ')
      const minutes = parseInt(minutesPart.replace('m', ''))
      const totalMinutes = (parseInt(hours) * 60) + minutes
      
      const breakTime = entry.break_time || 0
      return total + ((totalMinutes - breakTime) / 60)
    }, 0)
  }

  const getWorkingDaysLastMonth = () => {
    const today = new Date()
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
    
    let count = 0
    const current = new Date(lastMonthStart)
    
    while (current <= lastMonthEnd) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++
      }
      current.setDate(current.getDate() + 1)
    }
    
    return count
  }

  const getLastMonthDateRange = () => {
    const today = new Date()
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
    return `${format(lastMonthStart, 'MMM d')} - ${format(lastMonthEnd, 'MMM d')}`
  }

  const calculateSelectedRangeHours = (entries: TimeEntry[], dateRange: DateRange | undefined) => {
    if (!dateRange?.from) return 0

    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      if (dateRange.to) {
        return entryDate >= dateRange.from && entryDate <= dateRange.to
      }
      return entryDate.toDateString() === dateRange.from.toDateString()
    })

    return filteredEntries.reduce((total, entry) => {
      const [hours, minutesPart] = entry.duration.split('h ')
      const minutes = parseInt(minutesPart.replace('m', ''))
      const totalMinutes = (parseInt(hours) * 60) + minutes
      const breakTime = entry.break_time || 0
      return total + ((totalMinutes - breakTime) / 60)
    }, 0)
  }

  // Calculate last week's hours
  const lastWeekHours = useMemo(() => {
    const entries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= lastWeekStart && entryDate <= lastWeekEnd
    })
    return calculateWeeklyHours(entries)
  }, [timeEntries, lastWeekStart, lastWeekEnd])

  // Calculate daily average
  const dailyAverage = useMemo(() => {
    if (!timeEntries.length) return 0;
    
    const uniqueDays = new Set(timeEntries.map(entry => entry.date)).size;
    const totalHours = timeEntries.reduce((total, entry) => {
      const [hours, minutesPart] = entry.duration.split('h ')
      const minutes = parseInt(minutesPart.replace('m', ''))
      const totalMinutes = (parseInt(hours) * 60) + minutes
      const breakTime = entry.break_time || 0
      return total + ((totalMinutes - breakTime) / 60)
    }, 0);
    
    return uniqueDays > 0 ? totalHours / uniqueDays : 0;
  }, [timeEntries]);

  return (
    <div className="p-6">
      <div className="flex-1 space-y-6">
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <DateRangePicker 
                        date={dateRange} 
                        onDateChange={setDateRange}
                        className="w-[260px]"
                      >
                        <Button 
                          variant="outline" 
                          className={cn(
                            "justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </DateRangePicker>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    className="w-80 p-3 bg-white border border-slate-200 shadow-lg"
                  >
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Date Range Selection</p>
                      <div className="text-xs text-slate-500 space-y-1">
                        <p>• Click to open the calendar</p>
                        <p>• Select a start date</p>
                        <p>• Select an end date</p>
                        <p>• Entries will be filtered to show only those within the selected range</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="h-full">
            <Card className="group relative overflow-hidden card-3d border-none bg-gradient-to-br from-blue-50 to-white h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 space-y-0 flex-shrink-0">
                <CardTitle className="text-xs font-medium text-blue-900/80 w-[80%]">Total Hours This Week</CardTitle>
                <div>
                  <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-1 flex-grow flex flex-col justify-between">
                <div>
                  <div className="text-xl font-bold text-blue-900">
                    {calculateWeeklyHours(filteredEntries)}h
                  </div>
                  <Progress 
                    value={calculateWeeklyProgress(filteredEntries)} 
                    className="mt-1 h-1 bg-blue-100" 
                  />
                </div>
                <p className="text-[10px] text-blue-600/70 mt-1 font-medium">
                  {getThisWeekDateRange()}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="h-full">
            <Card className="group relative overflow-hidden card-3d border-none bg-gradient-to-br from-amber-50 to-white h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 space-y-0 flex-shrink-0">
                <CardTitle className="text-xs font-medium text-amber-900/80 w-[80%]">Total Hours Last Week</CardTitle>
                <div>
                  <History className="h-4 w-4 text-amber-600 flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-1 flex-grow flex flex-col justify-between">
                <div>
                  <div className="text-2xl font-bold text-amber-900">
                    {calculateLastWeekHours(filteredEntries)}h
                  </div>
                  <Progress 
                    value={calculateLastWeekHours(filteredEntries) / (8 * getWorkingDaysLastWeek()) * 100} 
                    className="mt-2 h-1 bg-amber-100" 
                  />
                </div>
                <p className="text-xs text-amber-600/70 mt-2 font-medium line-clamp-1">
                  {getLastWeekDateRange()}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="h-full">
            <Card className="group relative overflow-hidden card-3d border-none bg-gradient-to-br from-purple-50 to-white h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 space-y-0 flex-shrink-0">
                <CardTitle className="text-xs font-small text-purple-900/80 line-clamp-1">Total Hours Current Month</CardTitle>
                <div>
                  <Clock className="h-4 w-4 text-purple-600 flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 flex-grow flex flex-col justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-900">
                    {calculateCurrentMonthHours(filteredEntries)}h
                  </div>
                  <Progress 
                    value={calculateCurrentMonthHours(filteredEntries) / (8 * getWorkingDaysInCurrentMonth()) * 100} 
                    className="mt-2 h-1 bg-purple-100" 
                  />
                </div>
                <p className="text-xs text-purple-600/70 mt-2 font-medium line-clamp-1">
                  {getCurrentMonthDateRange()}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="h-full">
            <Card className="group relative overflow-hidden card-3d border-none bg-gradient-to-br from-violet-50 to-white h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 space-y-0 flex-shrink-0">
                <CardTitle className="text-sm font-medium text-violet-900/80 line-clamp-1">Total Hours Last Month</CardTitle>
                <div>
                  <Clock className="h-4 w-4 text-violet-600 flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 flex-grow flex flex-col justify-between">
                <div>
                  <div className="text-2xl font-bold text-violet-900">
                    {calculateLastMonthHours(filteredEntries)}h
                  </div>
                  <Progress 
                    value={calculateLastMonthHours(filteredEntries) / (8 * getWorkingDaysLastMonth()) * 100} 
                    className="mt-2 h-1 bg-violet-100" 
                  />
                </div>
                <p className="text-xs text-violet-600/70 mt-2 font-medium line-clamp-1">
                  {getLastMonthDateRange()}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="h-full">
            <Card className="group relative overflow-hidden card-3d border-none bg-gradient-to-br from-emerald-50 to-white h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 space-y-0 flex-shrink-0">
                <CardTitle className="text-sm font-medium text-emerald-900/80 line-clamp-1">Daily Average</CardTitle>
                <Target className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-4 pt-2 flex-grow flex flex-col justify-between">
                <div>
                  <div className="text-2xl font-bold text-emerald-900">
                    {formatHoursAndMinutes(calculateDailyAverage(filteredEntries))}
                  </div>
                  <Progress 
                    value={calculateTodayHours(filteredEntries) / 8 * 100} 
                    className="mt-2 h-1 bg-emerald-100" 
                  />
                </div>
                <p className="text-xs text-emerald-600/70 mt-2 font-medium line-clamp-1">
                  Per working day
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="h-full">
            <Card className="group relative overflow-hidden card-3d border-none bg-gradient-to-br from-orange-50 to-white h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 space-y-0 flex-shrink-0">
                <CardTitle className="text-xs font-medium text-orange-900/80 w-[80%]">Selected Date Range</CardTitle>
                <Calendar className="h-4 w-4 text-orange-600 flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-3 pt-1 flex-grow flex flex-col justify-between">
                <div>
                  <div className="text-xl font-bold text-orange-900">
                    {dateRange?.from && dateRange?.to ? (
                      `${calculateDateRangeStats(timeEntries, dateRange.from, dateRange.to).totalHours}h`
                    ) : (
                      "0h"
                    )}
                  </div>
                  <Progress 
                    value={dateRange?.from && dateRange?.to ? 
                      Number(calculateDateRangeStats(timeEntries, dateRange.from, dateRange.to).completionRate) : 0
                    } 
                    className="mt-1 h-1 bg-orange-100" 
                  />
                </div>
                <p className="text-[10px] text-orange-600/70 mt-1 font-medium line-clamp-1">
                  {dateRange?.from && dateRange?.to ? (
                    `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
                  ) : (
                    "Select dates from calendar"
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4 px-3">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={() => setIsPDFDialogOpen(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
            <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
          <div className="sm:hidden space-y-3 px-3">
            {filteredEntries.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                <p className="font-medium">No time entries yet</p>
                <p className="text-sm">Click the + button to add your first entry</p>
              </div>
            ) : (
              paginatedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="relative w-full rounded-xl border border-slate-200 shadow-lg overflow-hidden bg-gradient-to-br from-white to-slate-50/60 p-3 transition-transform active:scale-[0.97]"
                >
                  <div className="flex items-baseline justify-between flex-wrap">
                    <div className="font-semibold text-slate-700">
                      {format(new Date(entry.date), 'dd-MM-yyyy')}
                      <span className="block text-[10px] text-slate-400 italic">
                        {format(new Date(entry.date), 'EEEE')}
                      </span>
                    </div>
                    <div className="text-indigo-600 font-bold mt-2 sm:mt-0">
                      {calculateDuration(entry.start_time, entry.end_time, entry.break_time || 0)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] uppercase tracking-wide text-slate-400">Start</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2 py-0.5 font-semibold">
                        {entry.start_time.split(':').slice(0, 2).join(':')}
                      </span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] uppercase tracking-wide text-slate-400">End</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2 py-0.5 font-semibold">
                        {entry.end_time.split(':').slice(0, 2).join(':')}
                      </span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] uppercase tracking-wide text-slate-400">Break</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-700 px-2 py-0.5 font-semibold">{entry.break_time}m</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 col-span-3 mt-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50/80"
                        onClick={() => handleEdit(entry)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 hover:text-red-600 hover:bg-red-50/80"
                        onClick={() => setEntryToDelete(entry)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination (mobile & desktop) */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          <div className="rounded-xl border border-slate-200 shadow-lg bg-white overflow-x-auto hidden sm:block">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 hover:bg-slate-50/90">
                  <TableHead className="w-[180px] font-semibold text-slate-700 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px] font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      Start Time
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px] font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-500" />
                      End Time
                    </div>
                  </TableHead>
                  <TableHead className="w-[140px] font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-orange-500" />
                      Break
                    </div>
                  </TableHead>
                  <TableHead className="w-[160px] font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Duration
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px] font-semibold text-slate-700 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Settings2 className="h-4 w-4 text-slate-500" />
                      Actions
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <Clock className="h-8 w-8 mb-2 text-slate-400" />
                        <p className="font-medium">No time entries yet</p>
                        <p className="text-sm text-slate-400">Click the + button to add your first entry</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {paginatedEntries.map((entry) => (
                      <TableRow 
                        key={entry.id}
                        className="group transition-all duration-200 hover:bg-slate-50/80"
                      >
                        <TableCell className="font-medium text-slate-700 py-3">
                          {format(new Date(entry.date), 'dd-MM-yyyy')}
                          <span className="block text-[10px] text-slate-400 italic font-normal mt-0.5">
                            {format(new Date(entry.date), 'EEEE')}
                          </span>
                        </TableCell>
                        <TableCell className="text-green-600 font-medium py-3">
                          {entry.start_time.split(':').slice(0, 2).join(':')}
                        </TableCell>
                        <TableCell className="text-red-600 font-medium py-3">
                          {entry.end_time.split(':').slice(0, 2).join(':')}
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
                            <Coffee className="h-3.5 w-3.5" />
                            {entry.break_time}m
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          {calculateDuration(
                            entry.start_time,
                            entry.end_time,
                            entry.break_time || 0
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 transition-all"
                                  onClick={() => handleEdit(entry)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-auto p-2">
                                <p className="text-xs font-medium">Edit Entry</p>
                              </HoverCardContent>
                            </HoverCard>

                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-slate-600 hover:text-red-600 hover:bg-red-50/80 transition-all"
                                  onClick={() => setEntryToDelete(entry)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-auto p-2 bg-red-50">
                                <p className="text-xs font-medium text-red-600">Delete Entry</p>
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Time Entry</DialogTitle>
            <DialogDescription>
              Record your work time by entering the details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="break_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Break (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Entry</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Time Entry
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this entry from {entryToDelete?.date}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {entryToDelete && format(new Date(entryToDelete.date), 'dd MMM yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                {entryToDelete?.start_time} - {entryToDelete?.end_time} 
                ({entryToDelete?.duration})
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntryToDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={async () => {
                if (entryToDelete?.id) {
                  await deleteTimeEntry(entryToDelete.id)
                  setEntryToDelete(null)
                  toast.success('Time entry deleted successfully')
                  // Refresh entries after deletion
                  const entries = await getTimeEntries() 
                  setTimeEntries(entries)
                }
              }}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PDFDateSelectionDialog
        open={isPDFDialogOpen}
        onOpenChange={setIsPDFDialogOpen}
        timeEntries={timeEntries}
      />
    </div>
  )
}

