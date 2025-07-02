import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Briefcase, Calculator, CreditCard, Receipt, TrendingUp } from "lucide-react"
import { calculateMonthlyPayment } from "@/lib/payment-calculations"
import { calculateWeeklyHoursArray } from "@/lib/time-calculations"
import { TimeEntry } from "@/types/time-entry"

interface PaymentReportProps {
  timeEntries: TimeEntry[]
}

export function PaymentReport({ timeEntries }: PaymentReportProps) {
  if (!timeEntries?.length) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No time entries found for this period</p>
      </Card>
    )
  }

  const weeklyHours = calculateWeeklyHoursArray(timeEntries)
  const paymentDetails = calculateMonthlyPayment(weeklyHours)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Report</h2>
          <p className="text-muted-foreground">Monthly payment breakdown and projections</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Standard Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentDetails.standardHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Regular working hours</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentDetails.overtimeHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Additional hours worked</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gross Pay</CardTitle>
            <Receipt className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{paymentDetails.totalGrossPay.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Before deductions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Pay</CardTitle>
            <CreditCard className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{paymentDetails.finalNetPay.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Take-home amount</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Earnings Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Standard Pay</span>
                <span className="font-medium">£{paymentDetails.standardPay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Overtime Pay</span>
                <span className="font-medium">£{paymentDetails.overtimePay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span className="font-medium">Total Gross</span>
                <span className="font-bold">£{paymentDetails.totalGrossPay.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Income Tax</span>
                <span className="font-medium text-red-600">-£{paymentDetails.incomeTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>National Insurance</span>
                <span className="font-medium text-red-600">-£{paymentDetails.niContribution.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pension Contribution</span>
                <span className="font-medium text-red-600">-£{paymentDetails.pensionContribution.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span className="font-medium">Total Deductions</span>
                <span className="font-bold text-red-600">
                  -£{(paymentDetails.incomeTax + paymentDetails.niContribution + paymentDetails.pensionContribution).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 