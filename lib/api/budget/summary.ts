// API client for budget summary

export interface Summary {
  totalCurrent: number;
  totalIncome: number;
  totalExpense: number;
}

export async function fetchSummary(): Promise<Summary> {
  const response = await fetch('/api/budget/summary', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch summary');
  }

  const data = await response.json();
  return data;
}
