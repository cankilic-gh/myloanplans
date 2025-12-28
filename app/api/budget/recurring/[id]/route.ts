import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/api-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const recurringExpense = await prisma.recurringExpense.findFirst({
      where: { id: params.id, userId },
    });

    if (!recurringExpense) {
      return NextResponse.json(
        { error: "Recurring expense not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, amount, type, frequency, description, categoryId, accountId, nextDueDate } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (amount !== undefined) updateData.amount = amount;
    if (type !== undefined) updateData.type = type;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (description !== undefined) updateData.description = description;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (accountId !== undefined) updateData.accountId = accountId;
    if (nextDueDate !== undefined) updateData.nextDueDate = new Date(nextDueDate);

    const updated = await prisma.recurringExpense.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true,
        account: true,
      },
    });

    return NextResponse.json({ recurringExpense: updated });
  } catch (error: any) {
    console.error("Error updating recurring expense:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update recurring expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const recurringExpense = await prisma.recurringExpense.findFirst({
      where: { id: params.id, userId },
    });

    if (!recurringExpense) {
      return NextResponse.json(
        { error: "Recurring expense not found" },
        { status: 404 }
      );
    }

    await prisma.recurringExpense.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting recurring expense:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete recurring expense" },
      { status: 500 }
    );
  }
}
