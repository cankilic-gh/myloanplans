/**
 * Mortgage Calculation Utilities
 * Production-ready mathematical functions for mortgage calculations
 */

export interface MortgageInputs {
  principal: number;
  annualInterestRate: number;
  loanTermMonths: number;
  downPayment?: number;
  recurringExtraPayment?: number;
}

export interface PaymentScheduleRow {
  month: number;
  paymentAmount: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
  oneTimeExtraPayment?: number;
}

export interface MortgageResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  schedule: PaymentScheduleRow[];
  finalMonth?: number;
}

/**
 * Calculate monthly mortgage payment using standard formula
 * M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
 */
export function calculateMonthlyPayment(
  principal: number,
  monthlyInterestRate: number,
  numberOfPayments: number
): number {
  if (monthlyInterestRate === 0) {
    return principal / numberOfPayments;
  }

  const numerator = monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments);
  const denominator = Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1;

  return principal * (numerator / denominator);
}

/**
 * Generate complete amortization schedule with support for:
 * - Recurring extra payments
 * - One-time extra payments per month
 */
export function generateAmortizationSchedule(
  inputs: MortgageInputs
): MortgageResult {
  const {
    principal,
    annualInterestRate,
    loanTermMonths,
    downPayment = 0,
    recurringExtraPayment = 0,
  } = inputs;

  // Calculate loan amount after down payment
  const loanAmount = Math.max(0, principal - downPayment);

  if (loanAmount <= 0) {
    return {
      monthlyPayment: 0,
      totalInterest: 0,
      totalPayment: 0,
      schedule: [],
    };
  }

  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const baseMonthlyPayment = calculateMonthlyPayment(
    loanAmount,
    monthlyInterestRate,
    loanTermMonths
  );

  const schedule: PaymentScheduleRow[] = [];
  let remainingBalance = loanAmount;
  let totalInterestPaid = 0;
  let finalMonth = loanTermMonths;

  // Initialize one-time extra payments map (will be populated by user interactions)
  const oneTimePayments: Map<number, number> = new Map();

  for (let month = 1; month <= loanTermMonths; month++) {
    if (remainingBalance <= 0.01) {
      finalMonth = month - 1;
      break;
    }

    const interestPayment = remainingBalance * monthlyInterestRate;
    const principalPayment = Math.min(
      baseMonthlyPayment - interestPayment + recurringExtraPayment,
      remainingBalance
    );

    // Apply one-time extra payment if exists
    const oneTimeExtra = oneTimePayments.get(month) || 0;
    const totalPrincipalPayment = Math.min(
      principalPayment + oneTimeExtra,
      remainingBalance
    );

    const totalPaymentAmount = interestPayment + totalPrincipalPayment;
    remainingBalance = Math.max(0, remainingBalance - totalPrincipalPayment);

    totalInterestPaid += interestPayment;

    schedule.push({
      month,
      paymentAmount: totalPaymentAmount,
      principalPayment: totalPrincipalPayment,
      interestPayment,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      oneTimeExtraPayment: oneTimeExtra > 0 ? oneTimeExtra : undefined,
    });
  }

  return {
    monthlyPayment: baseMonthlyPayment,
    totalInterest: Math.round(totalInterestPaid * 100) / 100,
    totalPayment: Math.round((totalInterestPaid + loanAmount) * 100) / 100,
    schedule,
    finalMonth: finalMonth < loanTermMonths ? finalMonth : undefined,
  };
}

/**
 * Recalculate schedule from a specific month forward when one-time payment is added
 */
export function recalculateScheduleFromMonth(
  baseSchedule: PaymentScheduleRow[],
  targetMonth: number,
  oneTimePayment: number,
  monthlyInterestRate: number,
  baseMonthlyPayment: number,
  recurringExtraPayment: number
): PaymentScheduleRow[] {
  if (targetMonth < 1 || targetMonth > baseSchedule.length) {
    return baseSchedule;
  }

  const updatedSchedule = [...baseSchedule];
  const monthIndex = targetMonth - 1;

  // Get the balance before this month
  // For month 1, we need to reconstruct the starting balance
  // For subsequent months, use the previous month's remaining balance
  let balanceBeforeMonth: number;
  if (monthIndex > 0) {
    balanceBeforeMonth = updatedSchedule[monthIndex - 1].remainingBalance;
  } else {
    // For the first month, reconstruct starting balance from the base schedule
    // Starting balance = remaining balance + principal payment (including any one-time payment)
    const firstMonth = baseSchedule[0];
    if (firstMonth) {
      balanceBeforeMonth = firstMonth.remainingBalance + firstMonth.principalPayment;
    } else {
      return baseSchedule; // Invalid schedule
    }
  }

  // Apply one-time payment
  let remainingBalance = Math.max(0, balanceBeforeMonth - oneTimePayment);

  // Recalculate from target month forward
  for (let i = monthIndex; i < updatedSchedule.length; i++) {
    if (remainingBalance <= 0.01) {
      // Truncate schedule if loan is paid off
      updatedSchedule.splice(i);
      break;
    }

    const interestPayment = remainingBalance * monthlyInterestRate;
    const principalPayment = Math.min(
      baseMonthlyPayment - interestPayment + recurringExtraPayment,
      remainingBalance
    );

    const totalPaymentAmount = interestPayment + principalPayment;
    remainingBalance = Math.max(0, remainingBalance - principalPayment);

    updatedSchedule[i] = {
      ...updatedSchedule[i],
      month: i + 1,
      paymentAmount: totalPaymentAmount,
      principalPayment,
      interestPayment,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      oneTimeExtraPayment: i === monthIndex ? oneTimePayment : undefined,
    };
  }

  return updatedSchedule;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}



