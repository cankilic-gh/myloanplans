// API client for savings goals

function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('userEmail');
}

export interface YearlyBreakdown {
  year: number;
  balance: number;
}

export interface Projections {
  yearlyBreakdown: YearlyBreakdown[];
  totalContributions: number;
  totalInterest: number;
  finalBalance: number;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  initialAmount: number;
  monthlyAmount: number;
  interestRate: number;
  projectionYears: number;
  createdAt: string;
  updatedAt: string;
  projections: Projections;
}

export interface NewSavingsGoal {
  name: string;
  initialAmount?: number;
  monthlyAmount?: number;
  interestRate?: number;
  projectionYears?: number;
}

export interface UpdateSavingsGoal {
  name?: string;
  initialAmount?: number;
  monthlyAmount?: number;
  interestRate?: number;
  projectionYears?: number;
}

export async function fetchSavingsGoals(): Promise<SavingsGoal[]> {
  const userEmail = getUserEmail();

  if (!userEmail) {
    throw new Error('User not authenticated');
  }

  const response = await fetch('/api/budget/savings', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch savings goals');
  }

  const data = await response.json();
  return data.goals;
}

export async function createSavingsGoal(goal: NewSavingsGoal): Promise<SavingsGoal> {
  const userEmail = getUserEmail();

  if (!userEmail) {
    throw new Error('User not authenticated');
  }

  const response = await fetch('/api/budget/savings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
    body: JSON.stringify(goal),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create savings goal');
  }

  const data = await response.json();
  return data.goal;
}

export async function updateSavingsGoal(id: string, goal: UpdateSavingsGoal): Promise<SavingsGoal> {
  const userEmail = getUserEmail();

  if (!userEmail) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`/api/budget/savings/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
    body: JSON.stringify(goal),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update savings goal');
  }

  const data = await response.json();
  return data.goal;
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  const userEmail = getUserEmail();

  if (!userEmail) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`/api/budget/savings/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete savings goal');
  }
}
