import { Employee } from '@/services/employee-service'
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { calculateMonthlyTax } from "@/utils/salary-calculator"

export function calculateMonthlyPayment(
  weeklyHours: number[], 
  selectedMonth: Date = new Date(),
  employee: Employee
) {
  const totalHours = weeklyHours.reduce((sum, hours) => sum + hours, 0)
  
  const standardHours = Math.min(totalHours, 170)
  const overtimeHours = Math.max(0, totalHours - standardHours)
  
  const hourlyRate = employee.hourly_rate
  const overtimeRate = employee.overtime_rate
  
  const standardPay = standardHours * hourlyRate
  const overtimePay = overtimeHours * overtimeRate
  const totalGrossPay = standardPay + overtimePay
  
  const annualizedPay = totalGrossPay * 12
  const incomeTax = calculateMonthlyTax(annualizedPay, employee.tax_code)
  
  const niContribution = totalGrossPay * 0.12
  const pensionContribution = totalGrossPay * 0.05
  
  const totalDeductions = incomeTax + niContribution + pensionContribution
  const finalNetPay = totalGrossPay - totalDeductions
  
  return {
    standardHours,
    overtimeHours,
    standardPay,
    overtimePay,
    totalGrossPay,
    incomeTax,
    niContribution,
    pensionContribution,
    totalDeductions,
    finalNetPay,
    taxPeriod: selectedMonth.getMonth() + 1,
    taxYear: selectedMonth.getFullYear()
  }
} 