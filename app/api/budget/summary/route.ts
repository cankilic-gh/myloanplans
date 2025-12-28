import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get income transactions for current month
    const incomeTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        category: {
          type: "INCOME",
        },
      },
      select: {
        amount: true,
      },
    });

    // Get expense transactions for current month
    const expenseTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        category: {
          type: "EXPENSE",
        },
      },
      select: {
        amount: true,
      },
    });

    // Get recurring income
    const recurringIncome = await prisma.recurringExpense.findMany({
      where: {
        userId,
        type: "income",
      },
      select: {
        amount: true,
      },
    });

    // Get recurring expenses
    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        userId,
        type: "expense",
      },
      select: {
        amount: true,
      },
    });

    const totalIncome = 
      incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0) +
      recurringIncome.reduce((sum, re) => sum + re.amount, 0);

    const totalExpense = 
      expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0) +
      recurringExpenses.reduce((sum, re) => sum + re.amount, 0);

    const totalCurrent = totalIncome - totalExpense;

    return NextResponse.json({
      totalCurrent,
      totalIncome,
      totalExpense,
    });
  } catch (error: any) {
    console.error("Error fetching summary:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch summary" },
      { status: 500 }
    );
  }
}

