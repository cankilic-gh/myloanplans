// API client for budget projection

export interface ProjectionMonth {
  month: number;
  year: number;
  recurringIncome: number;
  recurringExpense: number;
  oneOffIncome: number;
  oneOffExpense: number;
  monthNet: number;
  runningBalance: number;
}

export interface ProjectionData {
  year: number;
  monthlyRecurringIncome: number;
  monthlyRecurringExpense: number;
  monthlyNet: number;
  yearlyIncome: number;
  yearlyExpense: number;
  yearEndBalance: number;
  months: ProjectionMonth[];
}

export async function fetchProjection(year?: number): Promise<ProjectionData> {
  const params = new URLSearchParams();
  if (year) {
    params.set('year', String(year));
  }

  const url = `/api/budget/projection${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch projection');
  }

  const data = await response.json();
  return data;
}
