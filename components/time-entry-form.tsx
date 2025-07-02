'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTimeEntries } from "@/hooks/useTimeEntries"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Coffee } from "lucide-react"

const timeEntrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  break_time: z.string().default("0"),
  description: z.string().optional(),
  billable: z.boolean().default(true)
})

export function TimeEntryForm({ onSuccess }: { onSuccess?: (entry: TimeEntry) => void }) {
  const [open, setOpen] = useState(false)
  const { addTimeEntry } = useTimeEntries()
  const { user } = useAuth()
  const form = useForm({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      description: "",
      start_time: "",
      end_time: "",
      date: new Date().toISOString().split('T')[0],
      break_time: "0",
      billable: true
    },
  })

  const calculateDuration = (start: string, end: string, breakTime: number) => {
    const startTime = new Date(`2000/01/01 ${start}`)
    const endTime = new Date(`2000/01/01 ${end}`)
    const diff = (endTime.getTime() - startTime.getTime()) / 1000 / 60
    const totalMinutes = diff - breakTime
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round(totalMinutes % 60)
    return `${hours}h ${minutes}m`
  }

  const onSubmit = async (data: z.infer<typeof timeEntrySchema>) => {
    try {
      const duration = calculateDuration(data.start_time, data.end_time, parseInt(data.break_time))
      const entryData = {
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        break_time: parseInt(data.break_time),
        description: data.description,
        duration: duration,
        user_id: user?.id
      }

      const newEntry = await addTimeEntry(entryData)
      if (onSuccess) onSuccess(newEntry)
      toast.success("Time entry added successfully")
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error('Error submitting time entry:', error)
      toast.error("Failed to add time entry")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-sm">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md w-full p-2 sm:p-6 overflow-y-auto">
        <DialogHeader className="px-1 py-2">
          <DialogTitle className="text-lg">Add Time</DialogTitle>
          <DialogDescription className="text-xs">
            Record your work hours
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 flex flex-col">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-blue-500" />
                    <FormLabel className="text-xs font-medium">Date</FormLabel>
                  </div>
                  <FormControl>
                    <Input type="date" {...field} className="w-full h-8 text-sm px-2" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                      <FormLabel className="text-xs font-medium">Start</FormLabel>
                    </div>
                    <FormControl>
                      <Input type="time" {...field} className="w-full h-8 text-sm px-2" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-3 bg-red-500 rounded-full"></div>
                      <FormLabel className="text-xs font-medium">End</FormLabel>
                    </div>
                    <FormControl>
                      <Input type="time" {...field} className="w-full h-8 text-sm px-2" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="break_time"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex items-center gap-1">
                    <Coffee className="h-3 w-3 text-orange-500" />
                    <FormLabel className="text-xs font-medium">Break (min)</FormLabel>
                  </div>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      placeholder="0"
                      {...field} 
                      className="w-full h-8 text-sm px-2"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex items-center gap-1">
                    <FormLabel className="text-xs font-medium">Description</FormLabel>
                  </div>
                  <FormControl>
                    <Input {...field} className="w-full h-8 text-sm px-2" placeholder="Optional" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billable"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 w-full">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 text-xs">Billable time</FormLabel>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-8 text-sm mt-2">
              Save Entry
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 