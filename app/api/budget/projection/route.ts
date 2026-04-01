import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/api-helpers";

// Normalize a recurring item's amount to its monthly equivalent
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

// Check if a recurring item hits a specific month based on frequency and nextDueDate
function hitsMonth(frequency: string, nextDueDate: Date, targetMonth: number, targetYear: number): boolean {
  const dueMonth = nextDueDate.getMonth() + 1; // 1-12
  const dueYear = nextDueDate.getFullYear();

  switch (frequency) {
    case "monthly":
    case "weekly_2":
      // These hit every month
      return true;
    case "semiannual": {
      // Hits every 6 months from the nextDueDate month
      // Calculate months since the due date's month
      const totalMonthsTarget = targetYear * 12 + targetMonth;
      const totalMonthsDue = dueYear * 12 + dueMonth;
      const diff = totalMonthsTarget - totalMonthsDue;
      return diff % 6 === 0 && diff >= 0;
    }
    case "yearly": {
      // Hits once a year in the same month as nextDueDate
      return targetMonth === dueMonth;
    }
    default:
      return true;
  }
}

// Get the actual amount for a specific month (for non-monthly frequencies that hit specific months)
function getMonthAmount(amount: number, frequency: string): number {
  switch (frequency) {
    case "monthly":
      return amount;
    case "weekly_2":
      // Biweekly: 26 payments per year, spread across months
      return (amount * 26) / 12;
    case "semiannual":
      return amount;
    case "yearly":
      return amount;
    default:
      return amount;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()), 10);

    // Fetch all recurring items for the user
    const recurringItems = await prisma.recurringExpense.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        amount: true,
        type: true,
        frequency: true,
        nextDueDate: true,
      },
    });

    // Fetch savings goals for the user (including extra contributions)
    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId },
      include: {
        contributions: {
          select: { amount: true, date: true },
        },
      },
    });

    // Sum monthly savings contributions
    const monthlySavings = savingsGoals.reduce(
      (sum, g) => sum + (g.monthlyAmount ?? 0),
      0
    );

    // Build a map of extra contributions by month for this year
    const extraContributionsByMonth: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) {
      extraContributionsByMonth[m] = 0;
    }
    for (const goal of savingsGoals) {
      for (const contribution of goal.contributions) {
        const contribYear = contribution.date.getFullYear();
        const contribMonth = contribution.date.getMonth() + 1;
        if (contribYear === year) {
          extraContributionsByMonth[contribMonth] += contribution.amount;
        }
      }
    }

    // Separate income and expenses
    const recurringIncomeItems = recurringItems.filter((r) => r.type === "income");
    const recurringExpenseItems = recurringItems.filter((r) => r.type === "expense");

    // Calculate monthly totals (normalized/averaged)
    const monthlyRecurringIncome = recurringIncomeItems.reduce(
      (sum, r) => sum + toMonthlyAmount(r.amount, r.frequency),
      0
    );
    const monthlyRecurringExpense = recurringExpenseItems.reduce(
      (sum, r) => sum + toMonthlyAmount(r.amount, r.frequency),
      0
    );

    // Fetch one-off transactions for the year (non-recurring)
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const oneOffTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfYear,
          lte: endOfYear,
        },
        source: { not: "recurring" },
        NOT: {
          note: { startsWith: "Recurring:" },
        },
      },
      select: {
        amount: true,
        date: true,
        category: {
          select: { type: true },
        },
      },
    });

    // Group one-off transactions by month
    const oneOffByMonth: Record<number, { income: number; expense: number }> = {};
    for (let m = 1; m <= 12; m++) {
      oneOffByMonth[m] = { income: 0, expense: 0 };
    }

    for (const tx of oneOffTransactions) {
      const txMonth = tx.date.getMonth() + 1;
      if (tx.category?.type === "INCOME") {
        oneOffByMonth[txMonth].income += tx.amount;
      } else {
        oneOffByMonth[txMonth].expense += tx.amount;
      }
    }

    // Build monthly breakdown
    let runningBalance = 0;
    const months = [];

    for (let month = 1; month <= 12; month++) {
      // Calculate recurring amounts that hit this specific month
      let recurringIncome = 0;
      for (const item of recurringIncomeItems) {
        if (hitsMonth(item.frequency, item.nextDueDate, month, year)) {
          recurringIncome += getMonthAmount(item.amount, item.frequency);
        }
      }

      let recurringExpense = 0;
      for (const item of recurringExpenseItems) {
        if (hitsMonth(item.frequency, item.nextDueDate, month, year)) {
          recurringExpense += getMonthAmount(item.amount, item.frequency);
        }
      }

      const oneOffIncome = oneOffByMonth[month].income;
      const oneOffExpense = oneOffByMonth[month].expense;
      const savingsExpense = monthlySavings + (extraContributionsByMonth[month] ?? 0);

      const monthNet = recurringIncome - recurringExpense - savingsExpense + oneOffIncome - oneOffExpense;
      runningBalance += monthNet;

      months.push({
        month,
        year,
        recurringIncome: Math.round(recurringIncome * 100) / 100,
        recurringExpense: Math.round(recurringExpense * 100) / 100,
        savingsExpense: Math.round(savingsExpense * 100) / 100,
        oneOffIncome: Math.round(oneOffIncome * 100) / 100,
        oneOffExpense: Math.round(oneOffExpense * 100) / 100,
        monthNet: Math.round(monthNet * 100) / 100,
        runningBalance: Math.round(runningBalance * 100) / 100,
      });
    }

    const monthlyNet = monthlyRecurringIncome - monthlyRecurringExpense - monthlySavings;
    const yearlyIncome = monthlyRecurringIncome * 12;
    const yearlyExpense = monthlyRecurringExpense * 12 + monthlySavings * 12;

    // Year-end balance includes recurring net + all one-off transactions
    const totalOneOffNet = oneOffTransactions.reduce((sum, tx) => {
      if (tx.category?.type === "INCOME") return sum + tx.amount;
      return sum - tx.amount;
    }, 0);
    const yearEndBalance = monthlyNet * 12 + totalOneOffNet;

    return NextResponse.json({
      year,
      monthlyRecurringIncome: Math.round(monthlyRecurringIncome * 100) / 100,
      monthlyRecurringExpense: Math.round(monthlyRecurringExpense * 100) / 100,
      monthlySavings: Math.round(monthlySavings * 100) / 100,
      monthlyNet: Math.round(monthlyNet * 100) / 100,
      yearlyIncome: Math.round(yearlyIncome * 100) / 100,
      yearlyExpense: Math.round(yearlyExpense * 100) / 100,
      yearEndBalance: Math.round(yearEndBalance * 100) / 100,
      months,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch projection";
    console.error("Error fetching projection:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
