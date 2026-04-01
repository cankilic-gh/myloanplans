import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/api-helpers";

export async function GET(
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
      goalId = pathParts[pathParts.length - 2];
    }

    if (!goalId) {
      return NextResponse.json(
        { error: "Savings goal ID is required" },
        { status: 400 }
      );
    }

    const goal = await prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Savings goal not found" },
        { status: 404 }
      );
    }

    const contributions = await prisma.savingsContribution.findMany({
      where: { goalId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ contributions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch contributions";
    console.error("Error fetching contributions:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(
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
      goalId = pathParts[pathParts.length - 2];
    }

    if (!goalId) {
      return NextResponse.json(
        { error: "Savings goal ID is required" },
        { status: 400 }
      );
    }

    const goal = await prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Savings goal not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { amount, date, note } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "A positive amount is required" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const contribution = await prisma.savingsContribution.create({
      data: {
        goalId,
        amount,
        date: new Date(date),
        note: note || null,
      },
    });

    return NextResponse.json({ contribution }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add contribution";
    console.error("Error adding contribution:", error);
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
      goalId = pathParts[pathParts.length - 2];
    }

    if (!goalId) {
      return NextResponse.json(
        { error: "Savings goal ID is required" },
        { status: 400 }
      );
    }

    // Verify goal belongs to user
    const goal = await prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Savings goal not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const contributionId = searchParams.get("contributionId");

    if (!contributionId) {
      return NextResponse.json(
        { error: "Contribution ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.savingsContribution.findFirst({
      where: { id: contributionId, goalId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Contribution not found" },
        { status: 404 }
      );
    }

    await prisma.savingsContribution.delete({
      where: { id: contributionId },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete contribution";
    console.error("Error deleting contribution:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
