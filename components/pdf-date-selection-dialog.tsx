import { useState } from "react"
import { format, eachDayOfInterval } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { TimesheetPDFTemplate } from "@/components/timesheet-pdf-template"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface PDFDateSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timeEntries: TimeEntry[]
}

export function PDFDateSelectionDialog({
  open,
  onOpenChange,
  timeEntries
}: PDFDateSelectionDialogProps) {
  const [date, setDate] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined
  })

  const filteredEntries = timeEntries.filter(entry => {
    if (!date?.from || !date?.to) return false
    const entryDate = new Date(entry.date)
    return entryDate >= date.from && entryDate <= date.to
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const getDatesInRange = () => {
    if (!date.from || !date.to) return []
    return eachDayOfInterval({ start: date.from, end: date.to })
  }

  const weekDates = getDatesInRange()

  const fileName = date.from && date.to
    ? `timesheet-${format(date.from, 'yyyy-MM-dd')}-to-${format(date.to, 'yyyy-MM-dd')}.pdf`
    : `timesheet-${format(new Date(), 'yyyy-MM')}.pdf`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] gap-0 p-0 pb-4">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Generate PDF Report</DialogTitle>
          <DialogDescription>
            Select a date range for your time entries report.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 flex gap-4">
          <div className="flex-1">
            <Calendar
              mode="range"
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              className="rounded-md border"
              classNames={{
                months: "flex flex-col md:flex-row space-y-4 md:space-x-4 md:space-y-0",
                head_cell: "text-muted-foreground font-normal text-xs",
                cell: cn(
                  "h-8 w-8 text-sm p-0 relative",
                  "hover:bg-accent hover:text-accent-foreground rounded-md",
                  "focus-within:relative focus-within:z-20"
                ),
                day: cn(
                  "h-8 w-8 p-0 font-normal",
                  "aria-selected:opacity-100"
                ),
                day_range_start: "day-range-start",
                day_range_end: "day-range-end",
                day_selected: 
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setDate({ from: undefined, to: undefined })
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          {date?.from && date?.to ? (
            <PDFDownloadLink
              document={
                <TimesheetPDFTemplate
                  timeEntries={filteredEntries}
                  weekDates={weekDates}
                  dateRange={{
                    from: date.from,
                    to: date.to
                  }}
                />
              }
              fileName={fileName}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
                "bg-indigo-600 text-white hover:bg-indigo-700",
                "h-10 px-4 py-2",
                filteredEntries.length === 0 && "opacity-50 cursor-not-allowed"
              )}
              disabled={filteredEntries.length === 0}
            >
              {({ loading, error }) => (
                <span className="flex items-center gap-2">
                  {loading ? (
                    <span className="animate-pulse">Generating...</span>
                  ) : error ? (
                    <span>Error generating PDF</span>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      <span>Download PDF</span>
                    </>
                  )}
                </span>
              )}
            </PDFDownloadLink>
          ) : (
            <Button
              disabled
              className="bg-indigo-600/50 text-white cursor-not-allowed"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 