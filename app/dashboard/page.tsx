'use client'

import { useEffect, useState } from 'react'
import { useProjects } from '@/hooks/useProjects'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Users, Briefcase, Target, Calendar as CalendarIcon, TrendingUp, Receipt, 
         Sparkles, Coffee, Bell, Rocket, Zap, Star, Heart, Award, Crown, 
         Flame, Smile, Sun, Moon, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { motion, AnimatePresence } from 'framer-motion'
import { WorkTimeTracker } from '@/components/work-time-tracker'
import { Progress } from "@/components/ui/progress"
import { cn } from '@/lib/utils'
import { getTodayHours, getYesterdayHours, formatHoursAndMinutes } from "@/lib/time-calculations"
import { CalendarCard } from '@/components/calendar-card'
import { format } from 'date-fns'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead,
  TableHeader, 
  TableRow 
} from "@/components/ui/table"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
}

export default function DashboardPage() {
  const { projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { getTimeEntries } = useTimeEntries();
  const [timeEntries, setTimeEntries] = useState<import('@/types/time-entry').TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("overview");

  const todayHours = getTodayHours(timeEntries);
  const yesterdayHours = getYesterdayHours(timeEntries);
  const hoursDiff = todayHours - yesterdayHours;

  const formatDateTime = (dateTimeString: string) => {
    try {
      if (!dateTimeString) return 'No date'
      
      // Parse ISO string or timestamp
      const date = new Date(dateTimeString)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      
      return format(date, 'MMM dd, yyyy HH:mm')
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const entriesData = await getTimeEntries();
        setTimeEntries(entriesData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [getTimeEntries]);

  if (isLoading || projectsLoading) return <LoadingSpinner />;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-950 dark:via-purple-900 dark:to-pink-900"
    >
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between bg-white/30 dark:bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20"
        >
          <div>
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.02 }}
            >
              Welcome back! ✨ Let's rock today! 🚀
            </motion.h1>
            <motion.p 
              className="text-slate-600 dark:text-slate-300 mt-2 text-lg flex items-center gap-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sun className="h-5 w-5 text-yellow-500 animate-spin-slow" />
              Here's what's happening today
            </motion.p>
          </div>
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.05 }}
          >
            <Button variant="ghost" size="icon" className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Bell className="h-5 w-5 text-indigo-600" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-[10px] font-medium text-white flex items-center justify-center animate-pulse">
                  3
                </span>
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>

        {/* Quick Stats Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div 
            whileHover={{ scale: 1.03, rotate: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none card-3d overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Today ⏰
                </CardTitle>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="h-6 w-6 text-yellow-300" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="text-3xl font-bold"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {formatHoursAndMinutes(todayHours)}
                </motion.div>
                <p className="text-sm mt-1 text-blue-100 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {hoursDiff > 0 ? '+' : ''}{formatHoursAndMinutes(hoursDiff)} vs yesterday
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Add similar motion.div wrappers with different gradients for other stat cards */}
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs 
            defaultValue="overview" 
            className="space-y-6"
            onValueChange={setActiveTab}
          >
            <TabsList className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-lg p-1 rounded-xl border border-white/20">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/30 dark:data-[state=active]:bg-slate-700/30">
                <Rocket className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="timesheet" className="data-[state=active]:bg-white/30 dark:data-[state=active]:bg-slate-700/30">
                <Clock className="h-4 w-4 mr-2" />
                Timesheet
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-white/30 dark:data-[state=active]:bg-slate-700/30">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 bg-white/30 dark:bg-slate-800/30 backdrop-blur-lg border-white/20 card-3d hover:shadow-xl transition-all">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-indigo-500" />
                          Weekly Progress 📈
                        </CardTitle>
                        <CardDescription>Your time distribution for the week</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <WorkTimeTracker />
                      </CardContent>
                    </Card>

                    <Card className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-lg border-white/20 card-3d hover:shadow-xl transition-all">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-pink-500" />
                          Active Projects 🎯
                        </CardTitle>
                        <CardDescription>{projects.length} ongoing projects</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {projects.slice(0, 3).map((project: any) => (
                          <div key={project.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{project.name}</span>
                              <span className="text-muted-foreground">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="timesheet">
                  <Card className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-lg border-white/20 card-3d">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-green-500" />
                        Time Entries 📝
                      </CardTitle>
                      <CardDescription>Manage your time entries</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="space-y-4">
                          {timeEntries.map((entry: any) => (
                            <Card key={entry.id} className="bg-white/50 dark:bg-slate-800/50">
                              <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{entry.project_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatDateTime(entry.start_time)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-lg">{formatHoursAndMinutes(entry.duration)}</p>
                                  <p className="text-sm text-muted-foreground">Duration</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="calendar">
                  <Card className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-lg border-white/20 card-3d">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-purple-500" />
                        Calendar View 📅
                      </CardTitle>
                      <CardDescription>View your schedule</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CalendarCard />
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  )
} 