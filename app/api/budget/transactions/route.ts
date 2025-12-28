import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get("x-user-email");
    console.log("[API] GET /api/budget/transactions - Request received:", {
      userEmail,
      url: request.url,
    });

    const userId = await getUserIdFromRequest(request);
    console.log("[API] User ID resolved:", userId);
    
    if (!userId) {
      console.error("[API] Unauthorized - no userId");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const filter = searchParams.get("filter") as "expense" | "income" | null;

    console.log("[API] Query params:", { limit, filter });

    const where: any = { userId };
    
    if (filter) {
      where.category = {
        type: filter.toUpperCase(),
      };
    }

    console.log("[API] Prisma query where clause:", JSON.stringify(where, null, 2));

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
      },
      orderBy: [
        { date: "desc" },
        { id: "desc" },
      ],
      take: limit,
    });

    console.log("[API] Transactions fetched:", {
      count: transactions.length,
      userId,
      filter,
      limit,
      sample: transactions.length > 0 ? {
        id: transactions[0].id,
        date: transactions[0].date,
        amount: transactions[0].amount,
        category: transactions[0].category,
      } : null,
    });

    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error("[API] Error fetching transactions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get("x-user-email");
    console.log("[API] POST /api/budget/transactions - Request received:", { userEmail });

    const userId = await getUserIdFromRequest(request);
    console.log("[API] POST - User ID resolved:", userId);
    
    if (!userId) {
      console.error("[API] POST - Unauthorized - no userId");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { accountId, categoryId, amount, currency = "USD", note, method, date, source = "manual" } = body;
    
    console.log("[API] POST - Transaction data:", {
      accountId,
      categoryId,
      amount,
      date,
      userId,
    });

    if (!accountId || !amount || !date) {
      return NextResponse.json(
        { error: "Account ID, amount, and date are required" },
        { status: 400 }
      );
    }

    // Check if account belongs to user
    const account = await prisma.budgetAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    // Check for duplicate transaction
    const duplicate = await prisma.transaction.findFirst({
      where: {
        userId,
        accountId,
        date: new Date(date),
        amount,
        note: note || null,
        categoryId: categoryId || null,
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "A duplicate transaction already exists" },
        { status: 409 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId,
        categoryId: categoryId || null,
        amount,
        currency,
        note: note || null,
        method: method || null,
        date: new Date(date),
        source,
      },
      include: {
        category: true,
        account: true,
      },
    });

    console.log("[API] POST - Transaction created:", {
      id: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.category,
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create transaction" },
      { status: 500 }
    );
  }
}

