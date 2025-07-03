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
      },
      {
        title: "Timesheet",
        href: "/timesheet",
        icon: FileText
      }
    ]
  },
  {
    title: "Analytics",
    items: [
      {
        title: "Kiosk",
        href: "/kiosk",
        icon: Grid,
        subItems: [
          {
            title: "Wages",
            href: "/dashboard/wages",
            icon: CreditCard
          }
        ]
      },
      {
        title: "Reports",
        href: "/reports",
        icon: Receipt
      }
    ]
  },
  {
    title: "Management",
    items: [
      {
        title: "Projects",
        href: "/projects",
        icon: LayoutDashboard
      },
      {
        title: "Expenses",
        href: "/expenses",
        icon: Receipt
      },
      {
        title: "Invoices",
        href: "/invoices",
        icon: FileText
      }
    ]
  },
  {
    title: "Team",
    items: [
      {
        title: "Members",
        href: "/members",
        icon: Users
      },
      {
        title: "Time Off",
        href: "/time-off",
        icon: Calendar
      }
    ]
  }
]