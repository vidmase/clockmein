import { CalendarComponent } from "@/components/calendar"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

export default function CalendarPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="border-r" />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-6">
            <CalendarComponent />
          </div>
        </main>
      </div>
    </div>
  )
}

