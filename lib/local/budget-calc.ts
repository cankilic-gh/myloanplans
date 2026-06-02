// Client-side port of the former server budget math.
// Logic is preserved 1:1 from app/api/budget/{projection,savings,summary}/route.ts.

import type {
  BudgetData,
  SavingsGoal,
  SavingsContribution,
  Frequency,
} from "./types";

const round2 = (n: number) => Math.round(n * 100) / 100;

// ---------------- Projection ----------------

// Normalize a recurring item's amount to its monthly equivalent (for averaged totals)
function toMonthlyAmount(amount: number, frequency: string): number {
  switch (frequency) {
    case "monthly":
      return amount;
    case "weekly_2":
      return (amount * 26) / 12;
    case "semiannual":
      return amount / 6;
    case "yearly":
      return amount / 12;
    default:
      return amount;
  }
}

// Whether a recurring item hits a specific month based on frequency + nextDueDate
function hitsMonth(
  frequency: string,
  nextDueDate: Date,
  targetMonth: number,
  targetYear: number
): boolean {
  const dueMonth = nextDueDate.getMonth() + 1;
  const dueYear = nextDueDate.getFullYear();

  switch (frequency) {
    case "monthly":
    case "weekly_2":
      return true;
    case "semiannual": {
      const totalMonthsTarget = targetYear * 12 + targetMonth;
      const totalMonthsDue = dueYear * 12 + dueMonth;
      const diff = totalMonthsTarget - totalMonthsDue;
      return diff % 6 === 0 && diff >= 0;
    }
    case "yearly":
      return targetMonth === dueMonth;
    default:
      return true;
  }
}

// The amount contributed in a month it actually hits
function getMonthAmount(amount: number, frequency: string): number {
  switch (frequency) {
    case "monthly":
      return amount;
    case "weekly_2":
      return (amount * 26) / 12;
    case "semiannual":
      return amount;
    case "yearly":
      return amount;
    default:
      return amount;
  }
}

export interface ProjectionMonth {
  month: number;
  year: number;
  recurringIncome: number;
  recurringExpense: number;
  savingsExpense: number;
  oneOffIncome: number;
  oneOffExpense: number;
  monthNet: number;
  runningBalance: number;
}

export interface ProjectionData {
  year: number;
  monthlyRecurringIncome: number;
  monthlyRecurringExpense: number;
  monthlySavings: number;
  monthlyNet: number;
  yearlyIncome: number;
  yearlyExpense: number;
  yearEndBalance: number;
  months: ProjectionMonth[];
}

export function computeProjection(data: BudgetData, year: number): ProjectionData {
  const { recurring, savingsGoals, transactions, categories } = data;

  const monthlySavings = savingsGoals.reduce(
    (sum, g) => sum + (g.monthlyAmount ?? 0),
    0
  );

  // Extra contributions by month for this year
  const extraContributionsByMonth: Record<number, number> = {};
  for (let m = 1; m <= 12; m++) extraContributionsByMonth[m] = 0;
  for (const goal of savingsGoals) {
    for (const contribution of goal.contributions) {
      const d = new Date(contribution.date);
      if (d.getFullYear() === year) {
        extraContributionsByMonth[d.getMonth() + 1] += contribution.amount;
      }
    }
  }

  const recurringIncomeItems = recurring.filter((r) => r.type === "income");
  const recurringExpenseItems = recurring.filter((r) => r.type === "expense");

  const monthlyRecurringIncome = recurringIncomeItems.reduce(
    (sum, r) => sum + toMonthlyAmount(r.amount, r.frequency),
    0
  );
  const monthlyRecurringExpense = recurringExpenseItems.reduce(
    (sum, r) => sum + toMonthlyAmount(r.amount, r.frequency),
    0
  );

  // One-off transactions for the year (exclude recurring-sourced)
  const categoryType = new Map(categories.map((c) => [c.id, c.type]));
  const oneOff = transactions.filter((t) => {
    if (t.source === "recurring") return false;
    const d = new Date(t.date);
    return d.getFullYear() === year;
  });

  const oneOffByMonth: Record<number, { income: number; expense: number }> = {};
  for (let m = 1; m <= 12; m++) oneOffByMonth[m] = { income: 0, expense: 0 };

  let totalOneOffIncome = 0;
  let totalOneOffExpense = 0;
  for (const tx of oneOff) {
    const m = new Date(tx.date).getMonth() + 1;
    const isIncome = tx.categoryId ? categoryType.get(tx.categoryId) === "INCOME" : false;
    if (isIncome) {
      oneOffByMonth[m].income += tx.amount;
      totalOneOffIncome += tx.amount;
    } else {
      oneOffByMonth[m].expense += tx.amount;
      totalOneOffExpense += Math.abs(tx.amount);
    }
  }

  let runningBalance = 0;
  const months: ProjectionMonth[] = [];

  for (let month = 1; month <= 12; month++) {
    let recurringIncome = 0;
    for (const item of recurringIncomeItems) {
      if (hitsMonth(item.frequency, new Date(item.nextDueDate), month, year)) {
        recurringIncome += getMonthAmount(item.amount, item.frequency);
      }
    }
    let recurringExpense = 0;
    for (const item of recurringExpenseItems) {
      if (hitsMonth(item.frequency, new Date(item.nextDueDate), month, year)) {
        recurringExpense += getMonthAmount(item.amount, item.frequency);
      }
    }

    const oneOffIncome = oneOffByMonth[month].income;
    const oneOffExpense = oneOffByMonth[month].expense;
    const savingsExpense = monthlySavings + (extraContributionsByMonth[month] ?? 0);

    const monthNet =
      recurringIncome - recurringExpense - savingsExpense + oneOffIncome - oneOffExpense;
    runningBalance += monthNet;

    months.push({
      month,
      year,
      recurringIncome: round2(recurringIncome),
      recurringExpense: round2(recurringExpense),
      savingsExpense: round2(savingsExpense),
      oneOffIncome: round2(oneOffIncome),
      oneOffExpense: round2(oneOffExpense),
      monthNet: round2(monthNet),
      runningBalance: round2(runningBalance),
    });
  }

  const monthlyNet = monthlyRecurringIncome - monthlyRecurringExpense - monthlySavings;
  const yearlyIncome = monthlyRecurringIncome * 12 + totalOneOffIncome;
  const yearlyExpense =
    monthlyRecurringExpense * 12 + monthlySavings * 12 + totalOneOffExpense;
  const yearEndBalance = yearlyIncome - yearlyExpense;

  return {
    year,
    monthlyRecurringIncome: round2(monthlyRecurringIncome),
    monthlyRecurringExpense: round2(monthlyRecurringExpense),
    monthlySavings: round2(monthlySavings),
    monthlyNet: round2(monthlyNet),
    yearlyIncome: round2(yearlyIncome),
    yearlyExpense: round2(yearlyExpense),
    yearEndBalance: round2(yearEndBalance),
    months,
  };
}

// ---------------- Summary (current month) ----------------

export interface Summary {
  totalCurrent: number;
  totalIncome: number;
  totalExpense: number;
}

export function computeSummary(data: BudgetData, ref: Date = new Date()): Summary {
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const categoryType = new Map(data.categories.map((c) => [c.id, c.type]));

  let totalIncome = 0;
  let totalExpense = 0;
  for (const tx of data.transactions) {
    const d = new Date(tx.date);
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;
    const isIncome = tx.categoryId ? categoryType.get(tx.categoryId) === "INCOME" : false;
    if (isIncome) totalIncome += tx.amount;
    else totalExpense += tx.amount;
  }
  return {
    totalCurrent: round2(totalIncome - totalExpense),
    totalIncome: round2(totalIncome),
    totalExpense: round2(totalExpense),
  };
}

// ---------------- Savings projection (compound interest) ----------------

export interface YearlyBreakdown {
  year: number;
  balance: number;
}

export interface Projections {
  yearlyBreakdown: YearlyBreakdown[];
  totalContributions: number;
  totalInterest: number;
  finalBalance: number;
}

export function calculateProjections(
  initialAmount: number,
  monthlyAmount: number,
  annualRate: number,
  years: number,
  extraContributions: SavingsContribution[] = []
): Projections {
  const monthlyRate = annualRate / 100 / 12;
  const yearlyBreakdown: YearlyBreakdown[] = [];

  const extraTotal = extraContributions.reduce((sum, c) => sum + c.amount, 0);
  let balance = initialAmount + extraTotal;
  const totalMonths = years * 12;

  for (let month = 1; month <= totalMonths; month++) {
    balance = (balance + monthlyAmount) * (1 + monthlyRate);
    if (month % 12 === 0) {
      yearlyBreakdown.push({ year: month / 12, balance: round2(balance) });
    }
  }

  const totalContributions = initialAmount + extraTotal + monthlyAmount * totalMonths;
  const finalBalance = round2(balance);
  const totalInterest = round2(finalBalance - totalContributions);

  return { yearlyBreakdown, totalContributions, totalInterest, finalBalance };
}

export function goalWithProjections(goal: SavingsGoal) {
  return {
    ...goal,
    projections: calculateProjections(
      goal.initialAmount,
      goal.monthlyAmount,
      goal.interestRate,
      goal.projectionYears,
      goal.contributions
    ),
  };
}
