import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/api-helpers";

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

    // Get id from params or URL
    let categoryId = params?.id;
    
    // If params.id is not available, try to get it from URL
    if (!categoryId) {
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      categoryId = pathParts[pathParts.length - 1];
    }
    
    if (!categoryId) {
      console.error("Category ID missing. Params:", params, "URL:", request.url);
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // First check if category exists and belongs to user
    const category = await prisma.budgetCategory.findFirst({
      where: { id: categoryId, userId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category is used in transactions or recurring expenses
    const transactionCount = await prisma.transaction.count({
      where: { categoryId },
    });

    const recurringCount = await prisma.recurringExpense.count({
      where: { categoryId },
    });

    if (transactionCount > 0 || recurringCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category that is used in transactions or recurring expenses" },
        { status: 400 }
      );
    }

    await prisma.budgetCategory.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    
    // Handle Prisma specific errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Cannot delete category that is used in transactions or recurring expenses" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}

