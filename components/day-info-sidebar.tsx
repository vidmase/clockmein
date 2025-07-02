import { format } from 'date-fns'
import { Clock, Coffee, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TimeEntry } from "@/types/time-entry"
import { calculateDuration } from "@/lib/time-calculations"
import { Button } from "@/components/ui/button"

interface DayInfoSidebarProps {
  date: Date
  entries: TimeEntry[]
  onClose: () => void
}

export function DayInfoSidebar({ date, entries, onClose }: DayInfoSidebarProps) {
  const dayEntries = entries.filter(entry => 
    entry.date === format(date, 'yyyy-MM-dd')
  )

  const totalHours = dayEntries.reduce((total, entry) => {
    const [hours, minutesPart] = entry.duration.split('h ')
    const minutes = parseInt(minutesPart.replace('m', ''))
    return total + (parseInt(hours) + minutes / 60)
  }, 0)

  const totalBreaks = dayEntries.reduce((total, entry) => 
    total + (entry.break_time || 0), 0
  )

  return (
    <div className="w-[300px] border-l p-4 space-y-4 bg-white shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {format(date, 'MMMM d, yyyy')}
        </h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Daily Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Hours</span>
            <span className="font-medium">{totalHours.toFixed(1)}h</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Break Time</span>
            <span className="font-medium">{totalBreaks}m</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Entries</h3>
        {dayEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No entries for this day</p>
        ) : (
          dayEntries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3.5 w-3.5" />
                    {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                  </div>
                  <span className="text-sm font-medium">{entry.duration}</span>
                </div>
                {entry.break_time > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Coffee className="h-3.5 w-3.5" />
                    {entry.break_time}m break
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 