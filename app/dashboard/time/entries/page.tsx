'use client'

import { useState, useEffect } from 'react'
import { TimeEntryForm } from "@/components/time-entry-form"
import { useTimeEntries } from "@/hooks/useTimeEntries"
import { useAuth } from "@/components/auth/auth-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from 'lucide-react'

export default function TimeEntriesPage() {
  const [entries, setEntries] = useState<import('@/types/time-entry').TimeEntry[]>([])
  const { getTimeEntries } = useTimeEntries()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  const loadEntries = async () => {
    if (user) {
      const data = await getTimeEntries()
      setEntries(data)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [user, getTimeEntries])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Time Entries</h1>
        <TimeEntryForm onSuccess={() => loadEntries()} />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                  No time entries yet. Click "New Entry" to get started.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(new Date(entry.date), 'DD/MM/YYYY')}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#e5e7eb' }}
                      />
                      {/* Project name not available: TimeEntry has no project property */}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(entry.start_time), 'HH:mm')}</TableCell>
                  <TableCell>{format(new Date(entry.end_time), 'HH:mm')}</TableCell>
                  <TableCell>{entry.duration}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 