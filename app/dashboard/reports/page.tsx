"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { type DateRange } from "react-day-picker"
import { 
  BarChart2, 
  PieChart,
  Clock, 
  Calendar,
  Download,
  Filter,
  Users,
  TrendingUp,
  Loader2,
  type LucideIcon
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { useTimeEntries } from "@/hooks/useTimeEntries"
import { useProjects } from "@/hooks/useProjects"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const { timeEntries, isLoading: entriesLoading } = useTimeEntries()
  const { projects, isLoading: projectsLoading } = useProjects()

  const handleExport = async (format: 'pdf' | 'csv') => {
    toast.success(`Exported as ${format.toUpperCase()}`)
  }

  if (entriesLoading || projectsLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Analyze your time tracking data and generate insights
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <DateRangePicker 
            date={dateRange}
            onDateChange={setDateRange}
          />
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-[400px]">
          <TabsTrigger value="overview">
            <BarChart2 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="time">
            <Clock className="mr-2 h-4 w-4" />
            Time
          </TabsTrigger>
          <TabsTrigger value="projects">
            <PieChart className="mr-2 h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="mr-2 h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Hours"
              value={timeEntries?.length ? calculateTotalHours(timeEntries) : 0}
              description="Hours tracked this year"
              icon={Clock}
              trend={+12.5}
            />
            <StatsCard
              title="Active Projects"
              value={projects?.length || 0}
              description="Ongoing projects"
              icon={PieChart}
              trend={-2.5}
            />
            <StatsCard
              title="Team Utilization"
              value="87%"
              description="Average utilization rate"
              icon={Users}
              trend={+5.2}
            />
            <StatsCard
              title="Productivity Score"
              value="92"
              description="Based on time tracking"
              icon={TrendingUp}
              trend={+3.1}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to calculate total hours
const calculateTotalHours = (entries: any[]) => {
  return entries.reduce((total, entry) => {
    return total + (parseFloat(entry.duration) || 0)
  }, 0).toFixed(1)
}

interface StatsCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  trend: number
}

function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          <span className={cn(
            "mr-1",
            trend > 0 ? "text-green-500" : "text-red-500"
          )}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  )
} 