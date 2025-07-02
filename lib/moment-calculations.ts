import moment from 'moment-business-days'
import { TimeEntry } from '@/components/work-time-tracker'

// Initialize moment-business-days with weekend configuration
moment.updateLocale('en', {
  workingWeekdays: [1, 2, 3, 4, 5, 6, 7] // Monday to Sunday
})

export function calculateTotalHours(entries: TimeEntry[] = [], startDate: Date, endDate: Date): number {
  if (!Array.isArray(entries)) return 0

  const filteredEntries = entries.filter(entry => {
    const entryDate = moment(entry.date)
    return entryDate.isBetween(moment(startDate), moment(endDate), 'day', '[]')
  })

  return Number(filteredEntries.reduce((total, entry) => {
    const [hours, minutesPart] = entry.duration.split('h ')
    const minutes = parseInt(minutesPart.replace('m', ''))
    const totalMinutes = (parseInt(hours) * 60) + minutes
    const breakTime = entry.break_time || 0
    return total + ((totalMinutes - breakTime) / 60)
  }, 0).toFixed(2))
} //Comment: Calculate total hours between dates

export function getWorkingDaysInRange(start: Date, end: Date): number {
  return moment(start).businessDiff(moment(end)) + 1
} //Comment: Calculate business days between dates

export function calculateDateRangeStats(entries: TimeEntry[], from: Date, to: Date) {
  if (!Array.isArray(entries)) return { totalHours: "0", completionRate: "0" }

  const totalHours = calculateTotalHours(entries, from, to)
  const workingDays = getWorkingDaysInRange(from, to)
  
  return {
    totalHours: totalHours.toFixed(1),
    completionRate: (totalHours / (workingDays * 8) * 100).toFixed(1),
    totalEntries: entries.length,
    workingDays
  }
} //Comment: Calculate stats for date range

export function getTimeRanges() {
  const now = moment()
  
  return {
    thisWeek: {
      start: now.clone().startOf('isoWeek').toDate(),
      end: now.clone().endOf('isoWeek').toDate()
    },
    lastWeek: {
      start: now.clone().subtract(1, 'week').startOf('isoWeek').toDate(),
      end: now.clone().subtract(1, 'week').endOf('isoWeek').toDate()
    },
    thisMonth: {
      start: now.clone().startOf('month').toDate(),
      end: now.clone().endOf('month').toDate()
    },
    lastMonth: {
      start: now.clone().subtract(1, 'month').startOf('month').toDate(),
      end: now.clone().subtract(1, 'month').endOf('month').toDate()
    }
  }
} //Comment: Get standardized date ranges using ISO week (Monday-Sunday)