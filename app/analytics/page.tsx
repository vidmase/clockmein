"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { TimeEntry } from "@/types/time-entry"
import { Wages } from "@/components/analytics/wages"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnalyticsPage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTimeEntries() {
      try {
        const { data, error } = await supabase
          .from('time_entries')
          .select('*')
          .order('date', { ascending: false })

        if (error) throw error
        setTimeEntries(data || [])
      } catch (error) {
        console.error('Error fetching time entries:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimeEntries()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Analytics</h2>
        <p className="text-muted-foreground">Detailed analysis of your work patterns and earnings</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Wages Overview</h3>
          <Wages timeEntries={timeEntries} />
        </div>
      </div>
    </div>
  )
} 