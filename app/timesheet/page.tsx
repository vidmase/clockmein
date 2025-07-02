import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Timesheet } from "@/components/timesheet"

export default function TimesheetPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="border-r" />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-6">
            <Timesheet />
          </div>
        </main>
      </div>
    </div>
  )
}

