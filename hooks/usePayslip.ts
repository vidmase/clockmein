import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';
import { PaymentDetails } from '@/types/payment';
import { PostgrestError } from '@supabase/supabase-js';

export function usePayslip() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);
  const supabase = createClientComponentClient();

  const generateAndSavePayslip = async (paymentDetails: PaymentDetails) => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('payslips')
        .insert([{
          user_id: user.id,
          tax_period: paymentDetails.taxPeriod,
          tax_year: paymentDetails.taxYear,
          pay_date: new Date().toISOString(),
          standard_hours: parseFloat(paymentDetails.standardHours.toFixed(2)),
          overtime_hours: parseFloat(paymentDetails.overtimeHours.toFixed(2)),
          standard_pay: parseFloat(paymentDetails.standardPay.toFixed(2)),
          overtime_pay: parseFloat(paymentDetails.overtimePay.toFixed(2)),
          total_gross: parseFloat(paymentDetails.totalGrossPay.toFixed(2)),
          tax_amount: parseFloat(paymentDetails.incomeTax.toFixed(2)),
          ni_amount: parseFloat(paymentDetails.niContribution.toFixed(2)),
          pension_amount: parseFloat(paymentDetails.pensionContribution.toFixed(2)),
          net_pay: parseFloat(paymentDetails.finalNetPay.toFixed(2))
        }]);

      if (error) throw error;
      return true;
    } catch (err) {
      const error = err as PostgrestError;
      setError(error);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateAndSavePayslip,
    isGenerating,
    error
  };
} 