import { Reports } from "@/components/reports"
import { Sidebar } from "@/components/sidebar"

export default function ReportsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="border-r" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6">
            <Reports />
          </div>
        </main>
      </div>
    </div>
  )
}

