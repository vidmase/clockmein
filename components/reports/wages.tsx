import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Calculator, CreditCard, Receipt, Clock, Target, Eye, Save } from "lucide-react"
import { TimeEntry } from "@/types/time-entry"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { usePayslip } from '@/hooks/usePayslip'
import { toast } from "@/components/ui/use-toast"
import { getPayslipForPeriod } from "@/utils/payslip-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, subMonths, startOfMonth, endOfMonth, differenceInHours, getWeek } from "date-fns"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface WagesProps {
  timeEntries?: TimeEntry[]
  date: {
    from: Date
    to: Date
  }
  paymentDetails: PaymentDetails | null
  onPayslipGenerated: (payslip: any) => void
}

export function Wages({ timeEntries, date, paymentDetails: currentPaymentDetails, onPayslipGenerated }: WagesProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(date.from)
  const [monthlyPayslips, setMonthlyPayslips] = useState<any[]>([])
  const [calculatedPaymentDetails, setCalculatedPaymentDetails] = useState<PaymentDetails | null>(null)
  const [showPayslip, setShowPayslip] = useState(false)
  const { generateAndSavePayslip, isGenerating, error } = usePayslip()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!timeEntries) return;
    
    // Calculate payment details for selected month
    const filteredEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.startTime)
      return format(entryDate, 'yyyy-MM') === format(selectedMonth, 'yyyy-MM')
    })
    
    const weeklyHours = filteredEntries.reduce((acc: number[], entry) => {
      const weekNumber = getWeek(new Date(entry.startTime))
      const hours = differenceInHours(new Date(entry.endTime), new Date(entry.startTime))
      acc[weekNumber] = (acc[weekNumber] || 0) + hours
      return acc
    }, [])

    const details = calculateMonthlyPayment(weeklyHours, selectedMonth)
    
    setCalculatedPaymentDetails({
      standardHours: details.standardHours.toFixed(1),
      overtimeHours: details.overtimeHours.toFixed(1),
      standardPay: details.standardPay.toFixed(2),
      overtimePay: details.overtimePay.toFixed(2),
      totalGrossPay: details.totalGrossPay.toFixed(2),
      incomeTax: details.incomeTax.toFixed(2),
      niContribution: details.niContribution.toFixed(2),
      pensionContribution: details.pensionContribution.toFixed(2),
      finalNetPay: details.finalNetPay.toFixed(2),
      taxPeriod: details.taxPeriod,
      taxYear: details.taxYear,
      taxCode: '1257L'
    })
  }, [timeEntries, selectedMonth])

  // Fetch payslips for last 12 months
  useEffect(() => {
    async function fetchPayslips() {
      const twelveMonthsAgo = subMonths(startOfMonth(new Date()), 11)
      
      const { data, error } = await supabase
        .from('payslips')
        .select('*')
        .gte('pay_date', twelveMonthsAgo.toISOString())
        .order('pay_date', { ascending: false })

      if (!error && data) {
        setMonthlyPayslips(data)
      }
    }
    fetchPayslips()
  }, [])

  // Get hours for selected month
  const selectedMonthPayslip = monthlyPayslips.find(payslip => 
    format(new Date(payslip.pay_date), 'yyyy-MM') === format(selectedMonth, 'yyyy-MM')
  )

  const totalHours = selectedMonthPayslip 
    ? Number(selectedMonthPayslip.standard_hours) + Number(selectedMonthPayslip.overtime_hours)
    : currentPaymentDetails 
      ? Number(currentPaymentDetails.standardHours) + Number(currentPaymentDetails.overtimeHours)
      : 0

  const handleGeneratePayslip = async () => {
    if (!calculatedPaymentDetails) return
    
    const success = await generateAndSavePayslip(calculatedPaymentDetails)
    
    if (success) {
      toast({
        title: "Payslip Generated",
        description: "Your payslip has been generated and saved successfully.",
      })
      const payslip = await getPayslipForPeriod(selectedMonth)
      onPayslipGenerated(payslip)
      // Refresh the payslips list
      const { data } = await supabase
        .from('payslips')
        .select('*')
        .gte('pay_date', subMonths(startOfMonth(new Date()), 11).toISOString())
        .order('pay_date', { ascending: false })
      if (data) setMonthlyPayslips(data)
    } else {
      toast({
        title: "Error",
        description: error || "Failed to generate payslip",
        variant: "destructive",
      })
    }
  }

  const handleSaveLastMonthHours = async () => {
    const lastMonth = subMonths(new Date(), 1)
    const startDate = startOfMonth(lastMonth)
    
    // Check if payslip already exists
    const { data: existingPayslip } = await supabase
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

    // Calculate hours and payment details
    const monthEntries = timeEntries?.filter(entry => {
      const entryDate = new Date(entry.startTime)
      return format(entryDate, 'yyyy-MM') === format(lastMonth, 'yyyy-MM')
    })

    const totalHours = monthEntries?.reduce((total, entry) => {
      return total + differenceInHours(new Date(entry.endTime), new Date(entry.startTime))
    }, 0) || 0

    const standardHours = Math.min(totalHours, 160)
    const overtimeHours = Math.max(0, totalHours - 160)
    const standardPay = standardHours * 12
    const overtimePay = overtimeHours * 18
    const totalGross = standardPay + overtimePay
    const taxAmount = totalGross * 0.2
    const niAmount = totalGross * 0.12
    const pensionAmount = totalGross * 0.05
    const netPay = totalGross - taxAmount - niAmount - pensionAmount

    const { error: insertError } = await supabase
      .from('payslips')
      .insert([{
        user_id: (await supabase.auth.getUser()).data.user?.id,
        pay_date: startDate.toISOString(),
        standard_hours: standardHours,
        overtime_hours: overtimeHours,
        standard_pay: standardPay.toFixed(2),
        overtime_pay: overtimePay.toFixed(2),
        total_gross: totalGross.toFixed(2),
        tax_amount: taxAmount.toFixed(2),
        ni_amount: niAmount.toFixed(2),
        pension_amount: pensionAmount.toFixed(2),
        net_pay: netPay.toFixed(2),
        tax_code: '1257L',
        tax_period: new Date().getMonth() + 1,
        tax_year: new Date().getFullYear()
      }])

    if (insertError) {
      console.error('Insert Error:', insertError)
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
    
    // Refresh payslips list
    const { data } = await supabase
      .from('payslips')
      .select('*')
      .gte('pay_date', subMonths(startOfMonth(new Date()), 11).toISOString())
      .order('pay_date', { ascending: false })
    
    if (data) {
      setMonthlyPayslips(data)
      // Update the calculated payment details
      setCalculatedPaymentDetails({
        standardHours: standardHours.toFixed(1),
        overtimeHours: overtimeHours.toFixed(1),
        standardPay: standardPay.toFixed(2),
        overtimePay: overtimePay.toFixed(2),
        totalGrossPay: totalGross.toFixed(2),
        incomeTax: taxAmount.toFixed(2),
        niContribution: niAmount.toFixed(2),
        pensionContribution: pensionAmount.toFixed(2),
        finalNetPay: netPay.toFixed(2),
        taxPeriod: new Date().getMonth() + 1,
        taxYear: new Date().getFullYear(),
        taxCode: '1257L'
      })
    }
  }

  const renderButton = () => {
    if (isGenerating) {
      return (
        <Button disabled className="bg-blue-600 text-white text-xs px-2 py-1 h-8" size="sm">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mr-1"
          >
            <Clock className="h-3 w-3" />
          </motion.div>
          <span className="text-xs">Processing...</span>
        </Button>
      )
    }

    const existingPayslip = monthlyPayslips.find(p => 
      format(new Date(p.pay_date), 'yyyy-MM') === format(selectedMonth, 'yyyy-MM')
    )

    if (existingPayslip) {
      return (
        <Button 
          onClick={() => setShowPayslip(true)}
          className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-8"
          size="sm"
        >
          <Eye className="h-3 w-3 mr-1" />
          <span className="text-xs">View Payslip</span>
        </Button>
      )
    }

    return (
      <Button 
        onClick={handleGeneratePayslip}
        disabled={!calculatedPaymentDetails}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 h-8"
        size="sm"
      >
        <Receipt className="h-3 w-3 mr-1" />
        <span className="text-xs">Generate Payslip</span>
      </Button>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02, rotate: 0.5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="h-full"
        >
          <Card className="group relative overflow-hidden card-3d border-none bg-gradient-to-br from-yellow-50 to-white h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 space-y-0">
              <CardTitle className="text-xs font-medium text-yellow-900/80">Total Hours Last Month</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent className="p-3 pt-1">
              <div className="flex flex-col space-y-2">
                <div>
                  <div className="text-xl font-bold text-yellow-900">
                    {totalHours.toFixed(1)}h
                  </div>
                  <Progress 
                    value={(totalHours / 200) * 100} 
                    className="mt-1 h-1 bg-yellow-100" 
                  />
                </div>
                {format(selectedMonth, 'yyyy-MM') === format(subMonths(new Date(), 1), 'yyyy-MM') && (
                  <Button
                    onClick={handleSaveLastMonthHours}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    size="sm"
                    disabled={monthlyPayslips.some(p => 
                      format(new Date(p.pay_date), 'yyyy-MM') === format(subMonths(new Date(), 1), 'yyyy-MM')
                    )}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {monthlyPayslips.some(p => 
                      format(new Date(p.pay_date), 'yyyy-MM') === format(subMonths(new Date(), 1), 'yyyy-MM')
                    ) ? 'Hours Already Recorded' : 'Record Last Month Hours'}
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-yellow-600/70 mt-2 font-medium">
                Previous month total hours
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02, rotate: 0.5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="h-full"
        >
          <Card className="group relative overflow-hidden card-3d border-none bg-gradient-to-br from-blue-50 to-white h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 space-y-0">
              <div className="flex flex-col space-y-2 w-full">
                <CardTitle className="text-xs font-medium text-blue-900/80">Total Hours</CardTitle>
                <Select
                  value={format(selectedMonth, 'yyyy-MM')}
                  onValueChange={(value) => setSelectedMonth(new Date(value))}
                >
                  <SelectTrigger className="w-full text-xs h-8">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = subMonths(new Date(), i)
                      return (
                        <SelectItem 
                          key={format(month, 'yyyy-MM')} 
                          value={format(month, 'yyyy-MM')}
                        >
                          {format(month, 'MMMM yyyy')}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="p-3 pt-1">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xl font-bold text-blue-900">
                    {totalHours.toFixed(1)} hrs
                  </div>
                  <Progress 
                    value={(totalHours / 200) * 100} 
                    className="mt-1 h-1 bg-blue-100" 
                  />
                </div>
                {renderButton()}
              </div>
              <p className="text-[10px] text-blue-600/70 mt-1 font-medium">
                Monthly working hours
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={showPayslip} onOpenChange={setShowPayslip}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payslip for {format(selectedMonth, 'MMMM yyyy')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMonthPayslip && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Earnings</h3>
                  <div className="flex justify-between">
                    <span>Standard Hours ({selectedMonthPayslip.standard_hours}h)</span>
                    <span>£{selectedMonthPayslip.standard_pay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overtime Hours ({selectedMonthPayslip.overtime_hours}h)</span>
                    <span>£{selectedMonthPayslip.overtime_pay}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Gross Pay</span>
                    <span>£{selectedMonthPayslip.total_gross}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Deductions</h3>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>£{selectedMonthPayslip.tax_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>National Insurance</span>
                    <span>£{selectedMonthPayslip.ni_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pension</span>
                    <span>£{selectedMonthPayslip.pension_amount}</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-600">
                    <span>Net Pay</span>
                    <span>£{selectedMonthPayslip.net_pay}</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 