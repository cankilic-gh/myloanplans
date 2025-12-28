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

    const plan = await prisma.loanPlan.findFirst({
      where: { id: params.id, userId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Loan plan not found" },
        { status: 404 }
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

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (principalAmount !== undefined) updateData.principalAmount = parseFloat(principalAmount);
    if (interestRate !== undefined) updateData.interestRate = parseFloat(interestRate);
    if (termMonths !== undefined) updateData.termMonths = parseInt(termMonths);
    if (downPayment !== undefined) updateData.downPayment = downPayment ? parseFloat(downPayment) : null;
    if (recurringExtraPayment !== undefined) updateData.recurringExtraPayment = recurringExtraPayment ? parseFloat(recurringExtraPayment) : null;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (oneTimePayments !== undefined) updateData.oneTimePayments = JSON.stringify(oneTimePayments);

    const updated = await prisma.loanPlan.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ plan: updated });
  } catch (error: any) {
    console.error("Error updating loan plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update loan plan" },
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

    const plan = await prisma.loanPlan.findFirst({
      where: { id: params.id, userId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Loan plan not found" },
        { status: 404 }
      );
    }

    await prisma.loanPlan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting loan plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete loan plan" },
      { status: 500 }
    );
  }
}



