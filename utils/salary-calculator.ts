import { TAX_CONSTANTS } from './tax-constants';

export function calculateMonthlyTax(annualizedPay: number, taxCode: string = TAX_CONSTANTS.DEFAULT_TAX_CODE): number {
  let personalAllowance = TAX_CONSTANTS.STANDARD_PERSONAL_ALLOWANCE;
  
  // Adjust personal allowance for high earners
  if (annualizedPay > TAX_CONSTANTS.PA_REDUCTION_THRESHOLD) {
    const reduction = Math.min(
      personalAllowance,
      Math.floor((annualizedPay - TAX_CONSTANTS.PA_REDUCTION_THRESHOLD) * TAX_CONSTANTS.PA_REDUCTION_RATE)
    );
    personalAllowance -= reduction;
  }

  let taxableIncome = Math.max(0, annualizedPay - personalAllowance);
  let annualTax = 0;

  // Calculate tax for each band
  if (taxableIncome > TAX_CONSTANTS.HIGHER_RATE_THRESHOLD) {
    // Additional rate
    annualTax += (taxableIncome - TAX_CONSTANTS.HIGHER_RATE_THRESHOLD) * TAX_CONSTANTS.ADDITIONAL_RATE;
    taxableIncome = TAX_CONSTANTS.HIGHER_RATE_THRESHOLD;
  }

  if (taxableIncome > TAX_CONSTANTS.BASIC_RATE_THRESHOLD) {
    // Higher rate
    annualTax += (taxableIncome - TAX_CONSTANTS.BASIC_RATE_THRESHOLD) * TAX_CONSTANTS.HIGHER_RATE;
    taxableIncome = TAX_CONSTANTS.BASIC_RATE_THRESHOLD;
  }

  // Basic rate
  annualTax += taxableIncome * TAX_CONSTANTS.BASIC_RATE;

  return Math.round(annualTax / 12); // Monthly tax
}

export function calculateNationalInsurance(monthlyPay: number): number {
  let ni = 0;
  
  if (monthlyPay > TAX_CONSTANTS.NI_PRIMARY_THRESHOLD) {
    if (monthlyPay <= TAX_CONSTANTS.NI_UPPER_EARNINGS_LIMIT) {
      ni = (monthlyPay - TAX_CONSTANTS.NI_PRIMARY_THRESHOLD) * TAX_CONSTANTS.NI_RATE_BELOW_UEL;
    } else {
      ni = (TAX_CONSTANTS.NI_UPPER_EARNINGS_LIMIT - TAX_CONSTANTS.NI_PRIMARY_THRESHOLD) * TAX_CONSTANTS.NI_RATE_BELOW_UEL;
      ni += (monthlyPay - TAX_CONSTANTS.NI_UPPER_EARNINGS_LIMIT) * TAX_CONSTANTS.NI_RATE_ABOVE_UEL;
    }
  }

  return Math.round(ni);
} 