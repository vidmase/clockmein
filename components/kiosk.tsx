"use client"

import { useState, useEffect } from "react"
import { useTimeEntries } from "@/hooks/useTimeEntries"
import { useProjects } from "@/hooks/useProjects"
import { useAuth } from "@/components/auth/auth-provider"
import { Clock, Users, Briefcase, Coffee, ChevronRight, ChevronLeft, Play, Pause, Timer } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

interface ActiveSession {
  userId: string
  projectId: string
  startTime: string
  breakStartTime?: string
  totalBreakTime: number
}

export function Kiosk() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [activeSessions, setActiveSessions] = useState<Record<string, ActiveSession>>({})
  const [projects, setProjects] = useState([])
  const { user } = useAuth()
  const { addTimeEntry } = useTimeEntries()
  const { getProjects } = useProjects()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const projectsData = await getProjects()
      setProjects(projectsData)
    } catch (error) {
      toast.error("Failed to load projects")
    }
  }

  const startSession = () => {
    if (!selectedProject) {
      toast.error("Please select a project")
      return
    }

    setActiveSessions(prev => ({
      ...prev,
      [user.id]: {
        userId: user.id,
        projectId: selectedProject,
        startTime: format(new Date(), "HH:mm:ss"),
        totalBreakTime: 0
      }
    }))
    toast.success("Work session started")
  }

  const endSession = async () => {
    const session = activeSessions[user.id]
    if (!session) return

    try {
      await addTimeEntry({
        date: format(new Date(), "yyyy-MM-dd"),
        start_time: session.startTime,
        end_time: format(new Date(), "HH:mm:ss"),
        break_time: session.totalBreakTime,
        project_id: session.projectId,
        user_id: user.id
      })

      setActiveSessions(prev => {
        const newSessions = { ...prev }
        delete newSessions[user.id]
        return newSessions
      })

      toast.success("Work session ended")
    } catch (error) {
      toast.error("Failed to save time entry")
    }
  }

  const startBreak = () => {
    setActiveSessions(prev => ({
      ...prev,
      [user.id]: {
        ...prev[user.id],
        breakStartTime: format(new Date(), "HH:mm:ss")
      }
    }))
    toast.success("Break started")
  }

  const endBreak = () => {
    const session = activeSessions[user.id]
    if (!session?.breakStartTime) return

    const breakStart = new Date(`2000/01/01 ${session.breakStartTime}`)
    const breakEnd = new Date()
    const breakMinutes = Math.round((breakEnd.getTime() - breakStart.getTime()) / 1000 / 60)

    setActiveSessions(prev => ({
      ...prev,
      [user.id]: {
        ...prev[user.id],
        breakStartTime: undefined,
        totalBreakTime: prev[user.id].totalBreakTime + breakMinutes
      }
    }))
    toast.success("Break ended")
  }

  const userSession = activeSessions[user?.id]
  const isOnBreak = Boolean(userSession?.breakStartTime)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Time Kiosk</h1>
        <div className="text-2xl font-bold text-primary">
          {format(currentTime, "HH:mm:ss")}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KioskStats 
          activeSessions={activeSessions} 
          projects={projects}
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Time Entry</CardTitle>
          <CardDescription>
            Start and end your work sessions easily
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={selectedProject}
            onValueChange={setSelectedProject}
            disabled={Boolean(userSession)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-4">
            {!userSession ? (
              <Button 
                onClick={startSession} 
                className="w-full"
                disabled={!selectedProject}
              >
                <Play className="mr-2 h-4 w-4" />
                Start Working
              </Button>
            ) : (
              <>
                <Button 
                  onClick={endSession} 
                  variant="destructive"
                  className="w-full"
                >
                  <Pause className="mr-2 h-4 w-4" />
                  End Session
                </Button>
                <Button
                  onClick={isOnBreak ? endBreak : startBreak}
                  variant={isOnBreak ? "default" : "secondary"}
                  className="w-full"
                >
                  <Coffee className="mr-2 h-4 w-4" />
                  {isOnBreak ? "End Break" : "Start Break"}
                </Button>
              </>
            )}
          </div>

          {userSession && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Session Progress</span>
                <span>{userSession.totalBreakTime}m break time</span>
              </div>
              <Progress 
                value={isOnBreak ? 100 : 75} 
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function KioskStats({ activeSessions, projects }) {
  const activeCount = Object.keys(activeSessions).length
  const onBreakCount = Object.values(activeSessions)
    .filter(session => session.breakStartTime).length
  
  const activeProjects = new Set(
    Object.values(activeSessions).map(session => session.projectId)
  )

  return (
    <>
      <StatsCard
        title="Active Users"
        value={activeCount}
        description={`${onBreakCount} on break`}
        icon={Users}
        trend={10}
      />
      <StatsCard
        title="Active Projects"
        value={activeProjects.size}
        description="Being worked on now"
        icon={Briefcase}
        trend={-2}
      />
      <StatsCard
        title="Average Session"
        value="4.2h"
        description="Per user today"
        icon={Timer}
        trend={15}
      />
      <StatsCard
        title="Break Time"
        value="45m"
        description="Average per session"
        icon={Coffee}
        trend={-5}
      />
    </>
  )
}

function StatsCard({ title, value, description, icon: Icon, trend }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
          {trend && (
            <span className={cn(
              "ml-2",
              trend > 0 ? "text-green-600" : "text-red-600"
            )}>
              {trend > 0 ? "+" : ""}{trend}%
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  )
}

