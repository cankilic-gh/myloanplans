import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/api-helpers";

interface YearlyBreakdown {
  year: number;
  balance: number;
}

interface Projections {
  yearlyBreakdown: YearlyBreakdown[];
  totalContributions: number;
  totalInterest: number;
  finalBalance: number;
}

function calculateProjections(
  initialAmount: number,
  monthlyAmount: number,
  annualRate: number,
  years: number
): Projections {
  const monthlyRate = annualRate / 100 / 12;
  const yearlyBreakdown: YearlyBreakdown[] = [];

  let balance = initialAmount;
  const totalMonths = years * 12;

  for (let month = 1; month <= totalMonths; month++) {
    balance = (balance + monthlyAmount) * (1 + monthlyRate);

    if (month % 12 === 0) {
      yearlyBreakdown.push({
        year: month / 12,
        balance: Math.round(balance * 100) / 100,
      });
    }
  }

  const totalContributions = initialAmount + monthlyAmount * totalMonths;
  const finalBalance = Math.round(balance * 100) / 100;
  const totalInterest = Math.round((finalBalance - totalContributions) * 100) / 100;

  return {
    yearlyBreakdown,
    totalContributions,
    totalInterest,
    finalBalance,
  };
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

    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const goalsWithProjections = savingsGoals.map((goal) => ({
      ...goal,
      projections: calculateProjections(
        goal.initialAmount,
        goal.monthlyAmount,
        goal.interestRate,
        goal.projectionYears
      ),
    }));

    return NextResponse.json({ goals: goalsWithProjections });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch savings goals";
    console.error("Error fetching savings goals:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, initialAmount, monthlyAmount, interestRate, projectionYears } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        userId,
        name,
        initialAmount: initialAmount ?? 0,
        monthlyAmount: monthlyAmount ?? 0,
        interestRate: interestRate ?? 0,
        projectionYears: projectionYears ?? 5,
      },
    });

    const projections = calculateProjections(
      goal.initialAmount,
      goal.monthlyAmount,
      goal.interestRate,
      goal.projectionYears
    );

    return NextResponse.json(
      { goal: { ...goal, projections } },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create savings goal";
    console.error("Error creating savings goal:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
