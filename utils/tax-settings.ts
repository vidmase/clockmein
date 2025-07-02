import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function getUserTaxSettings() {
  const supabase = createClientComponentClient();
  
  const { data: taxSettings, error } = await supabase
    .from('tax_settings')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching tax settings:', error);
    return null;
  }

  return taxSettings;
}

export async function savePayslip(payslipData: PaymentDetails) {
  const supabase = createClientComponentClient();
  
  const { error } = await supabase
    .from('payslips')
    .insert([{
      tax_period: payslipData.taxPeriod,
      tax_year: payslipData.taxYear,
      pay_date: new Date(),
      standard_hours: payslipData.standardHours,
      overtime_hours: payslipData.overtimeHours,
      standard_pay: payslipData.standardPay,
      overtime_pay: payslipData.overtimePay,
      total_gross: payslipData.totalGrossPay,
      tax_amount: payslipData.incomeTax,
      ni_amount: payslipData.niContribution,
      pension_amount: payslipData.pensionContribution,
      net_pay: payslipData.finalNetPay
    }]);

  if (error) {
    console.error('Error saving payslip:', error);
    return false;
  }

  return true;
} 