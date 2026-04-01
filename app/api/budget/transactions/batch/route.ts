import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { accountId, transactions } = body;

    if (!accountId || !Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { error: "accountId and transactions array are required" },
        { status: 400 }
      );
    }

    // Verify account belongs to user
    const account = await prisma.budgetAccount.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Fetch existing categories for user
    const existingCategories = await prisma.budgetCategory.findMany({
      where: { userId },
    });
    const categoryMap = new Map<string, string>(); // lowercase name -> id
    for (const cat of existingCategories) {
      categoryMap.set(cat.name.toLowerCase(), cat.id);
    }

    // Collect unique new category names
    const newCategoryNames: string[] = [];
    const uniqueCategories = new Map<string, { name: string; type: string }>();
    for (const tx of transactions) {
      const key = tx.categoryName.toLowerCase();
      if (!categoryMap.has(key) && !uniqueCategories.has(key)) {
        uniqueCategories.set(key, { name: tx.categoryName, type: tx.categoryType });
      }
    }

    // Create new categories
    for (const [key, cat] of uniqueCategories) {
      const created = await prisma.budgetCategory.create({
        data: { userId, name: cat.name, type: cat.type },
      });
      categoryMap.set(key, created.id);
      newCategoryNames.push(cat.name);
    }

    // Fetch existing transactions for duplicate detection
    const dates = transactions.map((tx: { date: string }) => new Date(tx.date));
    const minDate = new Date(Math.min(...dates.map((d: Date) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d: Date) => d.getTime())));
    // Extend range by 1 day on each side for safety
    minDate.setDate(minDate.getDate() - 1);
    maxDate.setDate(maxDate.getDate() + 1);

    const existingTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        accountId,
        date: { gte: minDate, lte: maxDate },
      },
      select: { date: true, amount: true, note: true },
    });

    // Build fingerprint set for duplicate detection
    const fingerprints = new Set<string>();
    for (const et of existingTransactions) {
      const dateStr = et.date.toISOString().slice(0, 10);
      fingerprints.add(`${dateStr}|${et.amount}|${et.note || ""}`);
    }

    // Filter out duplicates and prepare create data
    let skipped = 0;
    const toCreate: Array<{
      userId: string;
      accountId: string;
      categoryId: string | null;
      amount: number;
      currency: string;
      note: string | null;
      method: string | null;
      date: Date;
      source: string;
    }> = [];

    for (const tx of transactions) {
      const dateStr = tx.date; // already YYYY-MM-DD
      const fp = `${dateStr}|${tx.amount}|${tx.note || ""}`;
      if (fingerprints.has(fp)) {
        skipped++;
        continue;
      }
      // Add to fingerprints to avoid duplicates within the same batch
      fingerprints.add(fp);

      const catId = categoryMap.get(tx.categoryName.toLowerCase()) || null;
      toCreate.push({
        userId,
        accountId,
        categoryId: catId,
        amount: tx.amount,
        currency: "USD",
        note: tx.note || null,
        method: tx.method || null,
        date: new Date(tx.date),
        source: "csv_import",
      });
    }

    // Batch insert
    let created = 0;
    if (toCreate.length > 0) {
      const result = await prisma.transaction.createMany({
        data: toCreate,
      });
      created = result.count;
    }

    return NextResponse.json({
      created,
      skipped,
      newCategories: newCategoryNames,
    });
  } catch (error: any) {
    console.error("Error in batch create transactions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to batch create transactions" },
      { status: 500 }
    );
  }
}
