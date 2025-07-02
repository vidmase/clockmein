import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface CustomCalendarProps {
  entries: any[]
  onDateSelect: (date: Date) => void
}

export function CustomCalendar({ entries, onDateSelect }: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const today = new Date();

  const handleDateClick = (date: Date) => {
    const hasEntries = entries.some(entry => 
      format(new Date(entry.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
    
    if (hasEntries) {
      setSelectedDate(date)
      onDateSelect(date)
    }
  }

  const getAdjustedDays = () => {
    const firstDayOfMonth = startOfMonth(currentDate)
    const dayOfWeek = firstDayOfMonth.getDay()
    const start = addDays(firstDayOfMonth, dayOfWeek === 0 ? -6 : 1 - dayOfWeek)
    
    const days = []
    for (let i = 0; i < 42; i++) {
      days.push(addDays(start, i))
    }
    return days
  }

  const calendarDays = getAdjustedDays()

  return (
    <Card className="p-4 shadow-lg border border-gray-200 bg-gradient-to-br from-white to-slate-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-xl tracking-tight text-gray-800 drop-shadow-sm">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() - 1)))}
            className="hover:bg-blue-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + 1)))}
            className="hover:bg-blue-100 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 bg-slate-50 rounded-lg p-2 border border-slate-100">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-slate-500 py-1 tracking-wide uppercase">
            {day}
          </div>
        ))}
        {calendarDays.map((date, i) => {
          const hasEntries = entries.some(entry => 
            format(new Date(entry.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          )
          const isToday = isSameDay(date, today)
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          return (
            <button
              key={date.toString()}
              onClick={() => handleDateClick(date)}
              className={cn(
                "relative h-12 w-full flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-300",
                !isSameMonth(date, currentDate) && "text-slate-300 bg-slate-100",
                isToday && !isSelected && "ring-2 ring-blue-400 bg-blue-50 text-blue-700 font-bold",
                isSelected && "bg-blue-600 text-white shadow-lg",
                !isSelected && !isToday && hasEntries && "bg-blue-50 hover:bg-blue-100 text-blue-700",
                !isSelected && !isToday && !hasEntries && "hover:bg-slate-200 text-slate-700"
              )}
              style={{ boxShadow: isSelected ? '0 4px 16px 0 rgba(37, 99, 235, 0.15)' : undefined }}
            >
              <span className="z-10">{format(date, 'd')}</span>
              {hasEntries && (
                <span className={cn(
                  "absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 border-white",
                  isSelected ? "bg-white" : "bg-blue-500"
                )} />
              )}
              {isToday && !isSelected && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              )}
            </button>
          )
        })}
      </div>
    </Card>
  )
} 