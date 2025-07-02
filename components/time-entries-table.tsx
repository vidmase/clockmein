import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Calendar, Home, Plus, Clock, Coffee } from 'lucide-react'
import { useState } from "react"

// Sample data for demonstration
const sampleEntries = [
  { id: '1', date: '2025-07-02', start_time: '06:00', end_time: '17:45', break_time: 45, duration: '11h 0m' },
  { id: '2', date: '2025-07-01', start_time: '06:00', end_time: '17:45', break_time: 45, duration: '11h 0m' },
  { id: '3', date: '2025-06-30', start_time: '06:00', end_time: '19:15', break_time: 45, duration: '12h 30m' },
  { id: '4', date: '2025-06-27', start_time: '06:00', end_time: '16:15', break_time: 45, duration: '9h 30m' },
]

export function TimeEntriesTable() {
  const [entries] = useState(sampleEntries)
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">Time Entries</h2>
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-sm">Add</span>
        </Button>
      </div>
      
      {/* Desktop Table (hidden on mobile) */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date</span>
                </div>
              </TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Break</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No entries found
                </TableCell>
              </TableRow>
            ) : (
              entries.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{formatDate(entry.date)}</div>
                      <div className="text-xs text-muted-foreground">{getDayName(entry.date)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-green-600">{entry.start_time}</TableCell>
                  <TableCell className="text-red-600">{entry.end_time}</TableCell>
                  <TableCell>{entry.break_time}m</TableCell>
                  <TableCell>{entry.duration}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Ultra-compact Mobile Cards */}
      <div className="md:hidden w-full overflow-x-hidden">
        <div className="flex flex-col gap-2">
          {entries.length === 0 ? (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground">No entries found</p>
            </div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="bg-white rounded-lg shadow-sm p-2 border border-gray-100 w-full">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Calendar className="h-3 w-3 text-blue-500" />
                  <span className="font-medium text-black">{formatDate(entry.date)}</span>
                  <span>({getDayName(entry.date).substring(0, 3)})</span>
                </div>
                <div className="flex flex-col gap-1 text-sm w-full">
                  <div><span className="font-semibold">Start:</span> <span className="text-green-600">{entry.start_time}</span></div>
                  <div><span className="font-semibold">End:</span> <span className="text-red-600">{entry.end_time}</span></div>
                  <div><span className="font-semibold">Break:</span> <span>{entry.break_time}m</span></div>
                  <div><span className="font-semibold">Total:</span> <span>{entry.duration}</span></div>
                </div>
                <div className="flex justify-end mt-1">
                  <button className="p-1"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Helper functions
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}-${month}-${year}`
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

