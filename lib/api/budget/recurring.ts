// API client for recurring expenses

function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('userEmail');
}

export type Frequency = 'weekly_2' | 'monthly' | 'semiannual' | 'yearly';

export interface RecurringExpense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  type: 'expense' | 'income';
  frequency: Frequency;
  description: string | null;
  categoryId: string | null;
  accountId: string | null; // Made optional to match schema
  nextDueDate: string;
  createdAt: string;
  category?: {
    id: string;
    name: string;
    type: string;
  } | null;
  account?: {
    id: string;
    name: string;
  } | null;
}

export interface NewRecurringExpense {
  name: string;
  amount: number;
  type: 'expense' | 'income';
  frequency: Frequency;
  description?: string | null;
  categoryId?: string | null;
  accountId?: string | null;
  nextDueDate: string; // YYYY-MM-DD
}

export function calculateNextDueDate(currentDate: string, frequency: Frequency): string {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case 'weekly_2':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'semiannual':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  return date.toISOString().slice(0, 10);
}

export async function fetchRecurringExpenses(
  type?: 'expense' | 'income'
): Promise<RecurringExpense[]> {
  const userEmail = getUserEmail();
  
  if (!userEmail) {
    throw new Error('User not authenticated');
  }

  const params = new URLSearchParams();
  if (type) {
    params.set('type', type);
  }

  const response = await fetch(`/api/budget/recurring?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch recurring expenses');
  }

  const data = await response.json();
  return data.recurringExpenses;
}

export async function createRecurringExpense(
  expense: NewRecurringExpense
): Promise<RecurringExpense> {
  const userEmail = getUserEmail();
  
  if (!userEmail) {
    throw new Error('User not authenticated');
  }

  const response = await fetch('/api/budget/recurring', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create recurring expense');
  }

  const data = await response.json();
  return data.recurringExpense;
}

export async function updateRecurringExpense(
  id: string,
  updates: Partial<NewRecurringExpense>
): Promise<RecurringExpense> {
  const userEmail = getUserEmail();
  
  if (!userEmail) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`/api/budget/recurring/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update recurring expense');
  }

  const data = await response.json();
  return data.recurringExpense;
}

export async function deleteRecurringExpense(id: string): Promise<void> {
  const userEmail = getUserEmail();
  
  if (!userEmail) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`/api/budget/recurring/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete recurring expense');
  }
}
