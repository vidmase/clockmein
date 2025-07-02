import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function getPayslipForPeriod(date: Date) {
  const supabase = createClientComponentClient();
  
  const startDate = startOfMonth(date);
  const endDate = endOfMonth(date);
  
  const { data: payslip, error } = await supabase
    .from('payslips')
    .select('*')
    .gte('pay_date', startDate.toISOString())
    .lte('pay_date', endDate.toISOString())
    .single();

  if (error) {
    console.error('Error fetching payslip:', error);
    return null;
  }

  return payslip;
} 