import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/api-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    let goalId = resolvedParams?.id;

    if (!goalId) {
      const url = new URL(request.url);
      const pathParts = url.pathname.split("/");
      goalId = pathParts[pathParts.length - 1];
    }

    if (!goalId) {
      console.error("Savings goal ID missing. Params:", resolvedParams, "URL:", request.url);
      return NextResponse.json(
        { error: "Savings goal ID is required" },
        { status: 400 }
      );
    }

    const existingGoal = await prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Savings goal not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, initialAmount, monthlyAmount, interestRate, projectionYears } = body;

    const updateData: Record<string, string | number> = {};
    if (name !== undefined) updateData.name = name;
    if (initialAmount !== undefined) updateData.initialAmount = initialAmount;
    if (monthlyAmount !== undefined) updateData.monthlyAmount = monthlyAmount;
    if (interestRate !== undefined) updateData.interestRate = interestRate;
    if (projectionYears !== undefined) updateData.projectionYears = projectionYears;

    const updated = await prisma.savingsGoal.update({
      where: { id: goalId },
      data: updateData,
    });

    return NextResponse.json({ goal: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update savings goal";
    console.error("Error updating savings goal:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    let goalId = resolvedParams?.id;

    if (!goalId) {
      const url = new URL(request.url);
      const pathParts = url.pathname.split("/");
      goalId = pathParts[pathParts.length - 1];
    }

    if (!goalId) {
      console.error("Savings goal ID missing. Params:", resolvedParams, "URL:", request.url);
      return NextResponse.json(
        { error: "Savings goal ID is required" },
        { status: 400 }
      );
    }

    const existingGoal = await prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Savings goal not found" },
        { status: 404 }
      );
    }

    await prisma.savingsGoal.delete({
      where: { id: goalId },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete savings goal";
    console.error("Error deleting savings goal:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
