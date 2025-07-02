import { Clock, Receipt, CreditCard, LayoutDashboard, CalendarDays, FileText, Grid, Users, Calendar } from "lucide-react"

export const navigationItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Time Tracker",
        href: "/time-tracker",
        icon: Clock
      },
      {
        title: "Calendar",
        href: "/calendar",
        icon: CalendarDays
      }
    ]
  },
  {
    title: "Analytics",
    items: [
      {
        title: "Reports",
        href: "/reports",
        icon: Receipt
      }
    ]
  }
]