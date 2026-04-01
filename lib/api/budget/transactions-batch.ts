import type { BatchCreateRequest, BatchCreateResponse } from "@/lib/csv/types";

export async function batchCreateTransactions(
  data: BatchCreateRequest
): Promise<BatchCreateResponse> {
  const response = await fetch("/api/budget/transactions/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to import transactions");
  }

  return response.json();
}
