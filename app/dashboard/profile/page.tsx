import { EmployeeProfile } from "@/components/employee/profile"

export default function EmployeeProfilePage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Employee Profile</h2>
        <p className="text-muted-foreground">Manage your employee information and settings</p>
      </div>
      <EmployeeProfile />
    </div>
  )
} 