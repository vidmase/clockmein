"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Minus, Plus, Settings, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CalendarComponent() {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() - date.getDay() + i)
    return date
  })

  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`
  }

  const formatDateRange = () => {
    const start = weekDates[0]
    const end = weekDates[6]
    return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()}, ${start.getFullYear()} - ${end.toLocaleDateString('en-US', { month: 'short' })} ${end.getDate()}, ${end.getFullYear()}`
  }

  const hours = Array.from({ length: 7 }, (_, i) => 17 + i)

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 p-6 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Tabs defaultValue="week" className="relative">
            <TabsList className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/20">
              <TabsTrigger 
                value="calendar" 
                className="data-[state=active]:bg-violet-500 data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>
              <TabsTrigger 
                value="week"
                className="data-[state=active]:bg-violet-500 data-[state=active]:text-white"
              >
                Week
              </TabsTrigger>
              <TabsTrigger 
                value="day"
                className="data-[state=active]:bg-violet-500 data-[state=active]:text-white"
              >
                Day
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hover:bg-violet-100 dark:hover:bg-violet-900/50">
            <Settings className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </Button>
          <Select defaultValue="teammates">
            <SelectTrigger className="w-[180px] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-white/20">
              <SelectValue placeholder="Select teammates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="teammates">All Teammates</SelectItem>
              <SelectItem value="john">John Doe</SelectItem>
              <SelectItem value="jane">Jane Smith</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center rounded-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/20">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigateWeek('prev')}
              className="hover:bg-violet-100 dark:hover:bg-violet-900/50"
            >
              <ChevronLeft className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </Button>
            <div className="px-4 py-2 font-medium">{formatDateRange()}</div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigateWeek('next')}
              className="hover:bg-violet-100 dark:hover:bg-violet-900/50"
            >
              <ChevronRight className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="grid grid-cols-[auto_repeat(7,1fr)]">
          <div className="p-4 bg-violet-50/50 dark:bg-violet-900/20 border-r border-white/20 flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-violet-100 dark:hover:bg-violet-900/50">
              <Minus className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-violet-100 dark:hover:bg-violet-900/50">
              <Plus className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </Button>
          </div>
          {weekDates.map((date, index) => (
            <div 
              key={date.toISOString()} 
              className="p-4 text-center border-r last:border-r-0 bg-violet-50/50 dark:bg-violet-900/20 border-white/20"
            >
              <div className="font-medium text-violet-900 dark:text-violet-100">{formatDate(date)}</div>
              <div className="text-sm text-violet-600/70 dark:text-violet-300/70">00:00:00</div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-[auto_repeat(7,1fr)]">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-[auto_repeat(7,1fr)]" style={{ gridColumn: '1 / -1' }}>
              <div className="p-4 border-r border-white/20 text-sm text-violet-600/70 dark:text-violet-300/70 w-20 bg-violet-50/30 dark:bg-violet-900/10">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {Array(7).fill(null).map((_, index) => (
                <div 
                  key={index} 
                  className="border-r last:border-r-0 relative group hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-colors"
                >
                  <div className="absolute inset-0 border-b border-dotted border-violet-200 dark:border-violet-700"></div>
                  {hour === 21 && index === 0 && (
                    <motion.div 
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      className="absolute left-0 right-0 top-0 h-16 bg-violet-500/20 border-l-2 border-violet-500 cursor-pointer hover:bg-violet-500/30 transition-colors"
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

