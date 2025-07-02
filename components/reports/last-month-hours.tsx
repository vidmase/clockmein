import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"

interface LastMonthHoursProps {
  hours: number
  month: Date
}

export function LastMonthHours({ hours, month }: LastMonthHoursProps) {
  const supabase = createClientComponentClient()

  const handleSaveHours = async () => {
    const lastMonth = subMonths(new Date(), 1)
    const startDate = startOfMonth(lastMonth)
    const endDate = endOfMonth(lastMonth)

    const { data: existingPayslip, error: fetchError } = await supabase
      .from('payslips')
      .select('*')
      .eq('pay_date', startDate.toISOString())
      .single()

    if (existingPayslip) {
      toast({
        title: "Already Recorded",
        description: "Hours for this month have already been recorded.",
        variant: "destructive",
      })
      return
    }

    const { error: insertError } = await supabase
      .from('payslips')
      .insert([
        {
          pay_date: startDate.toISOString(),
          period_start: startDate.toISOString(),
          period_end: endDate.toISOString(),
          standard_hours: Math.min(hours, 160), // Assuming 160 standard hours per month
          overtime_hours: Math.max(0, hours - 160),
          status: 'pending'
        }
      ])

    if (insertError) {
      toast({
        title: "Error",
        description: "Failed to record hours.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Hours have been recorded successfully.",
    })
  }

  return (
    <Button
      onClick={handleSaveHours}
      className="mt-2 w-full bg-yellow-500 hover:bg-yellow-600 text-white"
      size="sm"
    >
      <Save className="h-4 w-4 mr-2" />
      Record Last Month Hours
    </Button>
  )
} 