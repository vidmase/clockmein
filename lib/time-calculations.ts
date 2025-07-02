import { startOfWeek, endOfWeek, isWithinInterval, parse, differenceInMinutes, format, startOfYear, endOfYear } from 'date-fns'
import { TimeEntry } from '../types/time-entry'

function getGMTDate(date: Date = new Date()): Date {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000)
}

export function calculateDuration(startTime: string, endTime: string, breakTime: number): string {
  const start = parse(startTime, 'HH:mm', new Date())
  const end = parse(endTime, 'HH:mm', new Date())
  
  const diffInMinutes = differenceInMinutes(end, start)
  const totalMinutes = Math.max(0, diffInMinutes - breakTime)
  
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  return `${hours}h ${minutes}m`
}

export function getWeekBoundaries(date: Date) {
  const gmtDate = getGMTDate(date)
  const monday = new Date(gmtDate)
  const dayOfWeek = gmtDate.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  monday.setDate(gmtDate.getDate() + diff)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return { monday, sunday }
}

export function calculateWeeklyHours(timeEntries: TimeEntry[]) {
  const { monday, sunday } = getWeekBoundaries(new Date())

  const weeklyEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.date + 'T00:00:00Z')
    return entryDate >= monday && entryDate <= sunday
  })

  return weeklyEntries.reduce((total, entry) => {
    const [hours, minutesPart] = entry.duration.split('h ')
    const minutes = parseInt(minutesPart.replace('m', ''))
    return total + (parseInt(hours) + minutes / 60)
  }, 0).toFixed(1)
}

export function getMonthBoundaries(date: Date) {
  const gmtDate = getGMTDate(date)
  const start = new Date(Date.UTC(gmtDate.getFullYear(), gmtDate.getMonth(), 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(gmtDate.getFullYear(), gmtDate.getMonth() + 1, 0, 23, 59, 59, 999))
  return { start, end }
}

export function calculateMonthlyHours(entries: TimeEntry[], date: Date): string {
  const { start, end } = getMonthBoundaries(date)

  const monthEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date + ' GMT')
    return entryDate >= start && entryDate <= end
  })

  const totalHours = monthEntries.reduce((total, entry) => {
    const [hours, minutesPart] = entry.duration.split('h ')
    const minutes = parseInt(minutesPart.replace('m', ''))
    const totalMinutes = (parseInt(hours) * 60) + minutes
    return total + (totalMinutes / 60)
  }, 0)

  return totalHours.toFixed(2)
}

export function getTimeEntryColor(entry: TimeEntry) {
  return 'bg-slate-50' // Default neutral background
}

export function calculateCurrentMonthHours(entries: TimeEntry[]): string {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const monthEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date)
    return entryDate >= firstDay && entryDate <= lastDay
  })

  const totalHours = monthEntries.reduce((total, entry) => {
    const [hours, minutesPart] = entry.duration.split('h ')
    const minutes = parseInt(minutesPart.replace('m', ''))
    return total + (parseInt(hours) + minutes / 60)
  }, 0)

  return totalHours.toFixed(2)
}

export function calculateDailyAverage(entries: TimeEntry[]): string {
  const { monday, sunday } = getWeekBoundaries(new Date())
  
  const weekEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date + ' GMT')
    return entryDate >= monday && entryDate <= sunday
  })

  if (weekEntries.length === 0) return "0.00"

  const uniqueDays = new Set(weekEntries.map(entry => entry.date)).size
  const totalHours = weekEntries.reduce((total, entry) => {
    const [hours, minutesPart] = entry.duration.split('h ')
    const minutes = parseInt(minutesPart.replace('m', ''))
    return total + (parseInt(hours) + minutes / 60)
  }, 0)

  return (totalHours / uniqueDays).toFixed(2)
}

export function formatHoursAndMinutes(hours: number) {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  return `${wholeHours}h ${minutes}m`
}

export function calculateHoursFromDuration(duration: string): number {
  const [hours, minutes] = duration.split('h ').map(part => parseInt(part))
  return hours + (minutes || 0) / 60
}

export function formatDuration(hours: number): string {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  return `${wholeHours}h ${minutes}m`
} // Comment: Format decimal hours into human-readable duration

export function getTodayHours(entries: TimeEntry[]) {
  const today = new Date().toISOString().split('T')[0]
  const todayEntries = entries.filter(entry => entry.date === today)
  
  return todayEntries.reduce((total, entry) => {
    // If entry has start_time and end_time, calculate actual duration
    if (entry.start_time && entry.end_time) {
      const start = new Date(`${entry.date} ${entry.start_time}`)
      const end = new Date(`${entry.date} ${entry.end_time}`)
      const diffInMinutes = (end.getTime() - start.getTime()) / 1000 / 60
      const breakTime = entry.break_time || 0
      return total + ((diffInMinutes - breakTime) / 60)
    }
    // Fallback to duration string if times not available
    const [hours, minutesPart] = entry.duration.split('h ')
    const minutes = parseInt(minutesPart.replace('m', ''))
    const totalMinutes = (parseInt(hours) * 60) + minutes
    const breakTime = entry.break_time || 0
    return total + ((totalMinutes - breakTime) / 60)
  }, 0)
}

export function getYesterdayHours(entries: TimeEntry[]) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayString = yesterday.toISOString().split('T')[0]
  
  const yesterdayEntries = entries.filter(entry => entry.date === yesterdayString)
  
  return yesterdayEntries.reduce((total, entry) => {
    // If entry has start_time and end_time, calculate actual duration
    if (entry.start_time && entry.end_time) {
      const start = new Date(`${entry.date} ${entry.start_time}`)
      const end = new Date(`${entry.date} ${entry.end_time}`)
      const diffInMinutes = (end.getTime() - start.getTime()) / 1000 / 60
      const breakTime = entry.break_time || 0
      return total + ((diffInMinutes - breakTime) / 60)
    }
    // Fallback to duration string if times not available
    const [hours, minutesPart] = entry.duration.split('h ')
    const minutes = parseInt(minutesPart.replace('m', ''))
    const totalMinutes = (parseInt(hours) * 60) + minutes
    const breakTime = entry.break_time || 0
    return total + ((totalMinutes - breakTime) / 60)
  }, 0)
}

export function calculateWeeklyHoursArray(entries: TimeEntry[]): number[] {
  const { monday, sunday } = getWeekBoundaries(new Date());
  const weeksInMonth = 5; // Maximum weeks in a month
  const weeklyHours: number[] = [];
  
  for (let i = 0; i < weeksInMonth; i++) {
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() - (7 * i));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });
    
    const totalHours = weekEntries.reduce((total, entry) => {
      const [hours, minutesPart] = entry.duration.split('h ');
      const minutes = parseInt(minutesPart.replace('m', ''));
      return total + (parseInt(hours) + minutes / 60);
    }, 0);
    
    weeklyHours.unshift(totalHours);
  }
  
  return weeklyHours;
}

export const calculateYearlyHours = (timeEntries: TimeEntry[]) => {
  if (!timeEntries?.length) return 0
  
  const currentYear = new Date()
  const yearStart = startOfYear(currentYear)
  const yearEnd = endOfYear(currentYear)

  const yearlyEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.date)
    return isWithinInterval(entryDate, { start: yearStart, end: yearEnd })
  })

  return yearlyEntries.reduce((total, entry) => {
    // Assuming duration is stored in hours or can be converted to hours
    const hours = typeof entry.duration === 'string' 
      ? parseFloat(entry.duration) 
      : entry.duration
    return total + hours
  }, 0)
}