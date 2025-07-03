"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, addDays, isToday } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, Briefcase, Clock, FileText, PlusCircle } from "lucide-react"
import { useProjects } from "@/hooks/useProjects"
import { useTimeEntries } from "@/hooks/useTimeEntries"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { calculateHoursFromDuration } from "@/lib/time-calculations"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { TimesheetPDFTemplate } from "@/components/timesheet-pdf-template"

interface TimeEntry {
  id?: string
  date: string
  start_time: string
  end_time: string
  description: string
  duration: string
  break_time: number
  user_id: string
  project_id?: string
  created_by?: string
  project?: {
    name: string
    color: string
  }
}

export function Timesheet() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedProject, setSelectedProject] = useState("all")
  const [projectsList, setProjectsList] = useState([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const { getProjects } = useProjects()
  const { getTimeEntries } = useTimeEntries()
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, entriesData] = await Promise.all([
          getProjects(),
          getTimeEntries()
        ])
        setProjectsList(projectsData)
        setTimeEntries(entriesData)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
  }, [getProjects, getTimeEntries])

  const filteredProjects = selectedProject === "all" 
    ? projectsList 
    : projectsList.filter(p => p.id === selectedProject)

  const getProjectHours = (projectId: string, date: Date) => {
    const dayEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return format(entryDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
             entry.project_id === projectId
    })

    const totalHours = dayEntries.reduce((total, entry) => {
      return total + calculateHoursFromDuration(entry.duration)
    }, 0)

    return totalHours.toFixed(2)
  }

  const getProjectTotalHours = (projectId: string) => {
    return weekDates.reduce((total, date) => {
      return total + parseFloat(getProjectHours(projectId, date))
    }, 0).toFixed(1)
  }

  const getDailyTotal = (date: Date) => {
    const dayEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return format(entryDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    })

    const totalHours = dayEntries.reduce((total, entry) => {
      const [hours, minutesPart] = entry.duration.split('h ')
      const minutes = parseInt(minutesPart.replace('m', ''))
      return total + (parseInt(hours) + minutes / 60)
    }, 0)

    return totalHours.toFixed(2)
  }

  const weeklyTotal = weekDates.reduce((total, date) => {
    return total + parseFloat(getDailyTotal(date))
  }, 0).toFixed(2)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Weekly Timesheet</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <p className="text-sm">
              {format(weekStart, 'MMMM d')} - {format(weekDates[6], 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[250px] bg-white">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projectsList.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${project.color}-500`} />
                    {project.name} - {project.client}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <WeekPicker 
            currentWeek={currentWeek}
            onPrevWeek={() => {
              const prev = new Date(currentWeek)
              prev.setDate(prev.getDate() - 7)
              setCurrentWeek(prev)
            }}
            onNextWeek={() => {
              const next = new Date(currentWeek)
              next.setDate(next.getDate() + 7)
              setCurrentWeek(next)
            }}
            onToday={() => setCurrentWeek(new Date())}
          />

          <Button 
            variant="outline" 
            className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
            asChild
          >
            <PDFDownloadLink
              document={
                <TimesheetPDFTemplate 
                  timeEntries={timeEntries}
                  weekDates={weekDates}
                  dateRange={{ from: weekStart, to: weekDates[6] }}
                />
              }
              fileName={`timesheet-${format(new Date(), 'yyyy-MM')}.pdf`}
            >
              {({ loading }) => (
                <span className="flex items-center gap-2">
                  {loading ? (
                    <span className="animate-pulse">Generating...</span>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      <span>Generate PDF</span>
                    </>
                  )}
                </span>
              )}
            </PDFDownloadLink>
          </Button>

          <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-lg">
        <div className="grid grid-cols-[2fr_repeat(7,1fr)_1fr] bg-gradient-to-r from-slate-50 to-white">
          <div className="p-4 font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-slate-400" />
              Projects
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 h-8"
                asChild
              >
                <PDFDownloadLink
                  document={
                    <TimesheetPDFTemplate 
                      timeEntries={timeEntries}
                      weekDates={weekDates}
                      dateRange={{ from: weekStart, to: weekDates[6] }}
                    />
                  }
                  fileName={`timesheet-${format(new Date(), 'yyyy-MM')}.pdf`}
                >
                  {({ loading }) => (
                    <span className="flex items-center gap-2">
                      {loading ? (
                        <span className="animate-pulse">Generating...</span>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          <span>PDF</span>
                        </>
                      )}
                    </span>
                  )}
                </PDFDownloadLink>
              </Button>
              <Button variant="outline" className="h-8">
                <PlusCircle className="h-4 w-4" />
                Add Entry
              </Button>
            </div>
          </div>
          {weekDates.map((date) => (
            <div 
              key={date.toISOString()} 
              className={cn(
                "p-4 text-center space-y-1",
                isToday(date) && "bg-blue-50/50 relative after:absolute after:top-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500"
              )}
            >
              <div className="font-medium">{format(date, 'EEE')}</div>
              <div className="text-sm text-muted-foreground">{format(date, 'MMM d')}</div>
            </div>
          ))}
          <div className="p-4 text-center font-medium bg-slate-50">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              Total
            </div>
          </div>
        </div>

        <div className="divide-y">
          {filteredProjects?.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              weekDates={weekDates}
              getProjectHours={getProjectHours}
              getProjectTotalHours={getProjectTotalHours}
            />
          ))}
          
          <div className="grid grid-cols-[2fr_repeat(7,1fr)_1fr] bg-slate-50/50">
            <div className="p-4 font-medium">Daily Totals</div>
            {weekDates.map((date) => (
              <div 
                key={date.toISOString()}
                className={cn(
                  "p-4 text-center font-medium",
                  isToday(date) && "bg-blue-50/50"
                )}
              >
                {getDailyTotal(date)}h
              </div>
            ))}
            <div className="p-4 text-center font-bold text-blue-600">
              {weeklyTotal}h
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ProjectRow({ project, weekDates, getProjectHours, getProjectTotalHours }) {
  return (
    <div className="grid grid-cols-[2fr_repeat(7,1fr)_1fr] hover:bg-slate-50/80 group transition-all">
      <div className="p-4 flex items-center gap-3">
        <div className={`w-1 h-8 rounded-full bg-${project.color}-500 group-hover:scale-y-110 transition-transform`} />
        <div className="flex flex-col">
          <span className="font-medium">{project.name}</span>
          <span className="text-xs text-muted-foreground">{project.client}</span>
        </div>
      </div>
      {weekDates.map((date) => (
        <TimeCell
          key={date.toISOString()}
          date={date}
          hours={getProjectHours(project.id, date)}
        />
      ))}
      <div className="p-4 text-center font-medium bg-slate-50/50">
        {getProjectTotalHours(project.id)}h
      </div>
    </div>
  )
}

function TimeCell({ date, hours }) {
  return (
    <div 
      className={cn(
        "p-4 text-center relative group/cell",
        isToday(date) && "bg-blue-50/30",
        parseFloat(hours) > 0 && "cursor-pointer hover:bg-slate-100"
      )}
    >
      <span className={cn(
        parseFloat(hours) === 0 && "text-slate-300",
        parseFloat(hours) > 0 && "text-slate-600"
      )}>
        {hours}h
      </span>
      
      {parseFloat(hours) > 0 && (
        <div className="absolute inset-x-4 bottom-3 h-0.5 bg-slate-200 scale-x-0 group-hover/cell:scale-x-100 transition-transform" />
      )}
    </div>
  )
}

function WeekPicker({ currentWeek, onPrevWeek, onNextWeek, onToday }: { currentWeek: Date, onPrevWeek: () => void, onNextWeek: () => void, onToday: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevWeek}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onToday}
      >
        Today
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onNextWeek}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  )
}

