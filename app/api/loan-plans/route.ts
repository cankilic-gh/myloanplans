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

    const plans = await prisma.loanPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error("Error fetching loan plans:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch loan plans" },
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
    const {
      name,
      principalAmount,
      interestRate,
      termMonths,
      downPayment,
      recurringExtraPayment,
      startDate,
      oneTimePayments,
    } = body;

    if (!name || principalAmount === undefined || interestRate === undefined || termMonths === undefined) {
      return NextResponse.json(
        { error: "Name, principalAmount, interestRate, and termMonths are required" },
        { status: 400 }
      );
    }

    const plan = await prisma.loanPlan.create({
      data: {
        userId,
        name,
        principalAmount: parseFloat(principalAmount),
        interestRate: parseFloat(interestRate),
        termMonths: parseInt(termMonths),
        downPayment: downPayment ? parseFloat(downPayment) : null,
        recurringExtraPayment: recurringExtraPayment ? parseFloat(recurringExtraPayment) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        oneTimePayments: oneTimePayments ? JSON.stringify(oneTimePayments) : "{}",
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating loan plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create loan plan" },
      { status: 500 }
    );
  }
}






