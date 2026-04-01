import type { BatchCreateRequest, BatchCreateResponse } from "@/lib/csv/types";

function getUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("userEmail");
}

export async function batchCreateTransactions(
  data: BatchCreateRequest
): Promise<BatchCreateResponse> {
  const userEmail = getUserEmail();
  if (!userEmail) {
    throw new Error("User not authenticated");
  }

  const response = await fetch("/api/budget/transactions/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-email": userEmail,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to import transactions");
  }

  return response.json();
}
