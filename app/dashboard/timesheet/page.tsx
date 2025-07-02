import { Timesheet } from "@/components/timesheet"

export default function TimesheetPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Timesheet</h1>
      </div>
      <Timesheet />
    </div>
  )
} 