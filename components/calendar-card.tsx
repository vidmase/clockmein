"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { format } from "date-fns"

export function CalendarCard() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const modifiersClassNames = {
    hasEntries: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-blue-500 after:rounded-full",
    today: "bg-white dark:bg-slate-800 text-primary font-bold border-2 border-primary",
    selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
  }

  return (
    <Card className="bg-gradient-to-br from-background/95 to-background/50 backdrop-blur-xl border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="w-full"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-between pt-1 relative items-center px-8",
            caption_label: "text-base font-semibold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent",
            nav: "flex items-center gap-1",
            nav_button: "h-8 w-8 bg-background/80 rounded-full p-0 opacity-70 hover:opacity-100 transition-all duration-200 hover:scale-110 hover:bg-background",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse",
            head_row: "flex w-full",
            head_cell: "text-muted-foreground rounded-md w-10 font-medium text-[0.8rem] h-10 flex items-center justify-center",
            row: "flex w-full mt-2",
            cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent/50",
            day: "h-10 w-10 p-0 font-normal rounded-full flex items-center justify-center transition-all duration-200 hover:bg-primary/10",
            day_range_middle: "rounded-none",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-lg",
            day_today: "bg-accent/20 text-accent-foreground ring-2 ring-primary ring-offset-2",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible",
          }}
          components={{
            DayContent: ({ date, ...props }) => (
              <motion.div
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="h-full w-full flex items-center justify-center"
                {...props}
              >
                {date.getDate()}
              </motion.div>
            )
          }}
        />
      </CardContent>
    </Card>
  )
}