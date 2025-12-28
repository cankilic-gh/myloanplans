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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "expense" | "income" | null;

    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    const recurringExpenses = await prisma.recurringExpense.findMany({
      where,
      include: {
        category: true,
        account: true,
      },
      orderBy: [
        { type: "desc" },
        { nextDueDate: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ recurringExpenses });
  } catch (error: any) {
    console.error("Error fetching recurring expenses:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch recurring expenses" },
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
    const { name, amount, type, frequency, description, categoryId, accountId, nextDueDate } = body;

    if (!name || !amount || !type || !frequency || !nextDueDate) {
      return NextResponse.json(
        { error: "Name, amount, type, frequency, and nextDueDate are required" },
        { status: 400 }
      );
    }

    if (type !== "expense" && type !== "income") {
      return NextResponse.json(
        { error: "Type must be expense or income" },
        { status: 400 }
      );
    }

    // Check if account belongs to user (if provided)
    if (accountId) {
      const account = await prisma.budgetAccount.findFirst({
        where: { id: accountId, userId },
      });

      if (!account) {
        return NextResponse.json(
          { error: "Account not found" },
          { status: 404 }
        );
      }
    }

    const recurringExpense = await prisma.recurringExpense.create({
      data: {
        userId,
        name,
        amount,
        type,
        frequency,
        description: description || null,
        categoryId: categoryId || null,
        accountId: accountId || null,
        nextDueDate: new Date(nextDueDate),
      },
      include: {
        category: true,
        account: true,
      },
    });

    return NextResponse.json({ recurringExpense }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating recurring expense:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create recurring expense" },
      { status: 500 }
    );
  }
}

