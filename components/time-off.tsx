"use client"

import { useState } from "react"
import { CalendarIcon, PlusCircle } from 'lucide-react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { addDays, format, differenceInDays } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

const bankHolidays2024 = [
  { date: "2024-01-01", name: "New Year's Day" },
  { date: "2024-03-29", name: "Good Friday" },
  { date: "2024-04-01", name: "Easter Monday" },
  { date: "2024-05-06", name: "Early May Bank Holiday" },
  { date: "2024-05-27", name: "Spring Bank Holiday" },
  { date: "2024-08-26", name: "Summer Bank Holiday" },
  { date: "2024-12-25", name: "Christmas Day" },
  { date: "2024-12-26", name: "Boxing Day" }
]

const timeOffFormSchema = z.object({
  dateRange: z.object({
    from: z.date({
      required_error: "Please select a start date.",
    }),
    to: z.date({
      required_error: "Please select an end date.",
    }),
  }),
  reason: z.string().min(5, {
    message: "Reason must be at least 5 characters.",
  }),
  type: z.enum(["paid", "unpaid"], {
    required_error: "Please select leave type",
  })
})

const currentUser = {
  name: "Vidmantas Daugvila",
  totalAnnualLeave: 25,
  usedPaidLeave: 25,
  usedUnpaidLeave: 9,
  requests: []
}

export function TimeOff() {
  const [timeOffRequests, setTimeOffRequests] = useState(currentUser.requests)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<z.infer<typeof timeOffFormSchema>>({
    resolver: zodResolver(timeOffFormSchema),
    defaultValues: {
      type: "paid"
    }
  })

  const onSubmit = (data: z.infer<typeof timeOffFormSchema>) => {
    const newRequest = {
      id: timeOffRequests.length + 1,
      employee: currentUser.name,
      startDate: format(data.dateRange.from, "yyyy-MM-dd"),
      endDate: format(data.dateRange.to, "yyyy-MM-dd"),
      status: "Pending",
      type: data.type,
      reason: data.reason
    }

    setTimeOffRequests([...timeOffRequests, newRequest])
    setIsDialogOpen(false)
    form.reset()
  }

  const remainingPaidDays = 0 // All 25 days used
  const usedUnpaidDays = currentUser.usedUnpaidLeave
  const bankHolidaysRemaining = bankHolidays2024.filter(holiday => 
    new Date(holiday.date) > new Date()
  ).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Time Off Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Request Time Off
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Time Off</DialogTitle>
              <DialogDescription>
                You have used all paid leave. Only unpaid leave available.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leave Type</FormLabel>
                      <FormControl>
                        <select 
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="unpaid">Unpaid Leave</option>
                          <option value="paid" disabled>Paid Leave (0 remaining)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date Range</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value?.from ? (
                              field.value.to ? (
                                <>
                                  {format(field.value.from, "LLL dd, y")} -{" "}
                                  {format(field.value.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(field.value.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            defaultMonth={new Date()}
                            selected={field.value}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide a reason for your time off request"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Submit Request</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Leave</CardTitle>
            <CalendarIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remainingPaidDays} days</div>
            <p className="text-xs text-muted-foreground">
              {currentUser.usedPaidLeave} used, {remainingPaidDays} remaining
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Leave Used</CardTitle>
            <CalendarIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usedUnpaidDays} days</div>
            <p className="text-xs text-muted-foreground">
              Total unpaid leave taken in 2024
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Bank Holiday</CardTitle>
            <CalendarIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {bankHolidays2024.find(holiday => new Date(holiday.date) > new Date()) ? (
              <>
                <div className="text-2xl font-bold">
                  {bankHolidays2024.find(holiday => new Date(holiday.date) > new Date())?.name}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(bankHolidays2024.find(holiday => new Date(holiday.date) > new Date())?.date || ''), "MMMM d, yyyy")}
                </p>
              </>
            ) : (
              <div className="text-sm">No upcoming bank holidays</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

