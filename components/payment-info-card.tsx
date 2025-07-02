import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Calculator, CreditCard, Receipt, Share } from "lucide-react"
import { calculateMonthlyPayment } from "@/lib/payment-calculations"
import { calculateWeeklyHoursArray } from "@/lib/time-calculations"
import { TimeEntry } from "@/types/time-entry"
import { useMemo } from "react"

interface PaymentInfoCardProps {
  timeEntries: TimeEntry[]
}

export function PaymentInfoCard({ timeEntries }: PaymentInfoCardProps) {
  const paymentDetails = useMemo(() => {
    if (!timeEntries?.length) return null;

    // Use the same calculation method as PaymentReport
    const weeklyHours = calculateWeeklyHoursArray(timeEntries);
    const details = calculateMonthlyPayment(weeklyHours);

    return {
      standardHours: details.standardHours,
      overtimeHours: details.overtimeHours,
      standardPay: details.standardPay,
      overtimePay: details.overtimePay,
      totalGrossPay: details.totalGrossPay,
      incomeTax: details.incomeTax,
      niContribution: details.niContribution,
      pensionContribution: details.pensionContribution,
      finalNetPay: details.finalNetPay
    };
  }, [timeEntries]);

  const totalDeductions = (paymentDetails?.incomeTax || 0) + 
                         (paymentDetails?.niContribution || 0) + 
                         (paymentDetails?.pensionContribution || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Information</CardTitle>
            <Calculator className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Standard Pay</span>
              <span className="font-medium">£{paymentDetails?.standardPay.toFixed(2)}</span>
            </div>
            // ... rest of the content
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 