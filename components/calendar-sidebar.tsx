"use client"

import { useState, useEffect } from "react"
import { CustomCalendar } from "@/components/custom-calendar"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DayInfoSidebar } from "@/components/day-info-sidebar"
import { useTimeEntries } from "@/hooks/useTimeEntries"

export function CalendarSidebar() {
  const [timeEntries, setTimeEntries] = useState<any[]>([])
  const { getTimeEntries } = useTimeEntries()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const loadEntries = async () => {
      const entries = await getTimeEntries()
      setTimeEntries(entries || [])
    }
    loadEntries()
  }, [getTimeEntries])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <CustomCalendar 
        entries={timeEntries} 
        onDateSelect={handleDateSelect} 
      />

      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setSelectedDate(null)
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          {selectedDate && (
            <DayInfoSidebar 
              date={selectedDate} 
              entries={timeEntries}
              onClose={() => {
                setIsDialogOpen(false)
                setSelectedDate(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 