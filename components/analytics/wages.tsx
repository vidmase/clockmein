import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Calculator, CreditCard, Receipt, Clock, Target } from "lucide-react"
import { calculateMonthlyPayment } from "@/lib/payment-calculations"
import { calculateWeeklyHoursArray } from "@/lib/time-calculations"
import { TimeEntry } from "@/types/time-entry"
import { Progress } from "@/components/ui/progress"
import { useMemo } from "react"
import { Employee } from "@/services/employee-service"

interface WagesProps {
  timeEntries: TimeEntry[]
}

export function Wages({ timeEntries }: WagesProps) {
  const paymentDetails = useMemo(() => {
    if (!timeEntries?.length) return null;
    
    const weeklyHours = calculateWeeklyHoursArray(timeEntries);
    
    const details = calculateMonthlyPayment(
      weeklyHours,
      new Date(),
      { hourly_rate: 15, overtime_rate: 22.5, tax_code: '1257L' } as Employee
    );
    
    return {
      standardHours: details.standardHours.toFixed(1),
      overtimeHours: details.overtimeHours.toFixed(1),
      standardPay: details.standardPay.toFixed(2),
      overtimePay: details.overtimePay.toFixed(2),
      totalGrossPay: details.totalGrossPay.toFixed(2),
      incomeTax: details.incomeTax.toFixed(2),
      niContribution: details.niContribution.toFixed(2),
      finalNetPay: details.finalNetPay.toFixed(2)
    };
  }, [timeEntries]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02, rotate: 0.5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="h-full"
        >
          <Card className="group relative overflow-hidden card-3d border-none bg-gradient-to-br from-blue-50 to-white h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 space-y-0 flex-shrink-0">
              <CardTitle className="text-xs font-medium text-blue-900/80 w-[80%]">Standard Hours</CardTitle>
              <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 pt-1 flex-grow flex flex-col justify-between">
              <div>
                <div className="text-xl font-bold text-blue-900">
                  {paymentDetails?.standardHours || '0'}h
                </div>
                <Progress 
                  value={Number(paymentDetails?.standardHours) / 40 * 100} 
                  className="mt-1 h-1 bg-blue-100" 
                />
              </div>
              <p className="text-[10px] text-blue-600/70 mt-1 font-medium">
                Regular working hours
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, rotate: 0.5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="h-full"
        >
          <Card className="group relative overflow-hidden card-3d border-none bg-gradient-to-br from-purple-50 to-white h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 space-y-0 flex-shrink-0">
              <CardTitle className="text-xs font-medium text-purple-900/80 w-[80%]">Overtime Hours</CardTitle>
              <Target className="h-4 w-4 text-purple-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 pt-1 flex-grow flex flex-col justify-between">
              <div>
                <div className="text-xl font-bold text-purple-900">
                  {paymentDetails?.overtimeHours || '0'}h
                </div>
                <Progress 
                  value={Number(paymentDetails?.overtimeHours) / 20 * 100} 
                  className="mt-1 h-1 bg-purple-100" 
                />
              </div>
              <p className="text-[10px] text-purple-600/70 mt-1 font-medium">
                Additional hours worked
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, rotate: 0.5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="h-full"
        >
          <Card className="group relative overflow-hidden card-3d border-none bg-gradient-to-br from-emerald-50 to-white h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 space-y-0 flex-shrink-0">
              <CardTitle className="text-xs font-medium text-emerald-900/80 w-[80%]">Gross Pay</CardTitle>
              <Receipt className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 pt-1 flex-grow flex flex-col justify-between">
              <div>
                <div className="text-xl font-bold text-emerald-900">
                  £{paymentDetails?.totalGrossPay || '0'}
                </div>
                <Progress 
                  value={Number(paymentDetails?.totalGrossPay) / 3000 * 100} 
                  className="mt-1 h-1 bg-emerald-100" 
                />
              </div>
              <p className="text-[10px] text-emerald-600/70 mt-1 font-medium">
                Before deductions
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, rotate: 0.5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="h-full"
        >
          <Card className="group relative overflow-hidden card-3d border-none bg-gradient-to-br from-amber-50 to-white h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 space-y-0 flex-shrink-0">
              <CardTitle className="text-xs font-medium text-amber-900/80 w-[80%]">Net Pay</CardTitle>
              <CreditCard className="h-4 w-4 text-amber-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 pt-1 flex-grow flex flex-col justify-between">
              <div>
                <div className="text-xl font-bold text-amber-900">
                  £{paymentDetails?.finalNetPay || '0'}
                </div>
                <Progress 
                  value={Number(paymentDetails?.finalNetPay) / 2500 * 100} 
                  className="mt-1 h-1 bg-amber-100" 
                />
              </div>
              <p className="text-[10px] text-amber-600/70 mt-1 font-medium">
                Take-home amount
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 