"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CreditCard, Receipt, TrendingUp } from "lucide-react"
import { PaymentReport } from "./reports/payment-report"
import { calculateMonthlyPayment } from "@/lib/payment-calculations"
import { calculateWeeklyHoursArray } from "@/lib/time-calculations"
import { supabase } from "@/lib/supabase"
import { TimeEntry } from "@/types/time-entry"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Wages } from "./reports/wages"

export function Reports() {
  const [activeView, setActiveView] = useState('overview')
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  useEffect(() => {
    async function fetchTimeEntries() {
      try {
        const { data, error } = await supabase
          .from('time_entries')
          .select('*')
          .order('date', { ascending: false })

        if (error) throw error
        setTimeEntries(data || [])
        
        if (data?.length) {
          const weeklyHours = calculateWeeklyHoursArray(data)
          const details = calculateMonthlyPayment(weeklyHours)
          setPaymentDetails(details)
        }
      } catch (error) {
        console.error('Error fetching time entries:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimeEntries()
  }, [])

  if (isLoading || !paymentDetails) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-6">
        <Button 
          variant={activeView === 'overview' ? 'default' : 'outline'}
          onClick={() => setActiveView('overview')}
        >
          Overview
        </Button>
        <Button 
          variant={activeView === 'wages' ? 'default' : 'outline'}
          onClick={() => setActiveView('wages')}
        >
          Wages
        </Button>
      </div>

      {activeView === 'overview' ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <motion.div
              whileHover={{ scale: 1.02, rotate: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="group relative overflow-hidden card-3d border-none bg-gradient-to-br from-blue-400 to-blue-600 text-white h-[130px] shadow-lg hover:shadow-blue-200/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Standard Hours</CardTitle>
                  <motion.div whileHover={{ rotate: 12 }} transition={{ duration: 0.2 }}>
                    <Clock className="h-4 w-4 opacity-70" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{paymentDetails.standardHours.toFixed(1)}h</div>
                  <p className="text-xs opacity-70">Regular working hours</p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, rotate: -0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="group relative overflow-hidden card-3d border-none bg-gradient-to-br from-purple-400 to-purple-600 text-white h-[130px] shadow-lg hover:shadow-purple-200/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
                  <motion.div whileHover={{ rotate: -12 }} transition={{ duration: 0.2 }}>
                    <Clock className="h-4 w-4 opacity-70" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{paymentDetails.overtimeHours.toFixed(1)}h</div>
                  <p className="text-xs opacity-70">Additional hours</p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, rotate: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="group relative overflow-hidden card-3d border-none bg-gradient-to-br from-emerald-400 to-emerald-600 text-white h-[130px] shadow-lg hover:shadow-emerald-200/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Gross Pay</CardTitle>
                  <motion.div whileHover={{ rotate: 12 }} transition={{ duration: 0.2 }}>
                    <Receipt className="h-4 w-4 opacity-70" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">£{paymentDetails.totalGrossPay.toFixed(2)}</div>
                  <p className="text-xs opacity-70">Before deductions</p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, rotate: -0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="group relative overflow-hidden card-3d border-none bg-gradient-to-br from-amber-400 to-amber-600 text-white h-[130px] shadow-lg hover:shadow-amber-200/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Net Pay</CardTitle>
                  <motion.div whileHover={{ rotate: -12 }} transition={{ duration: 0.2 }}>
                    <CreditCard className="h-4 w-4 opacity-70" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">£{paymentDetails.finalNetPay.toFixed(2)}</div>
                  <p className="text-xs opacity-70">Take-home pay</p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </Card>
            </motion.div>
          </div>
          <PaymentReport timeEntries={timeEntries} />
        </>
      ) : (
        <Wages timeEntries={timeEntries} />
      )}
    </div>
  )
}

