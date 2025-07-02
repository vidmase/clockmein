import { useState } from 'react'

type SortField = 'date' | 'start_time' | 'end_time' | 'break_time' | 'duration'
type SortDirection = 'asc' | 'desc'

export function useSortableTimeEntries() {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const sortEntries = (entries: any[]) => {
    return [...entries].sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1

      switch (sortField) {
        case 'date':
          return multiplier * (new Date(a.date).getTime() - new Date(b.date).getTime())
        
        case 'start_time':
        case 'end_time':
          const aTime = new Date(`2000/01/01 ${a[sortField]}`).getTime()
          const bTime = new Date(`2000/01/01 ${b[sortField]}`).getTime()
          return multiplier * (aTime - bTime)
        
        case 'break_time':
          return multiplier * ((a.break_time || 0) - (b.break_time || 0))
        
        case 'duration':
          const getDurationMinutes = (duration: string) => {
            const [hours, minutes] = duration.split('h ')
            return (parseInt(hours) * 60) + parseInt(minutes)
          }
          return multiplier * (getDurationMinutes(a.duration) - getDurationMinutes(b.duration))
        
        default:
          return 0
      }
    })
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  return { sortEntries, toggleSort, sortField, sortDirection }
} 