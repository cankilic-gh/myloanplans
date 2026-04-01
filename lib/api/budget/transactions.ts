// API client for budget transactions

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  amount: number;
  currency: string;
  note: string | null;
  method: string | null;
  date: string;
  source: string;
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

export interface NewTransaction {
  accountId: string;
  categoryId?: string | null;
  amount: number;
  currency?: string;
  note?: string | null;
  method?: string | null;
  date: string; // YYYY-MM-DD
  source?: string;
}

export async function fetchTransactions(
  limit: number = 20,
  filter?: 'expense' | 'income'
): Promise<Transaction[]> {
  const params = new URLSearchParams();
  params.set('limit', limit.toString());
  if (filter) {
    params.set('filter', filter);
  }

  const response = await fetch(`/api/budget/transactions?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch transactions');
  }

  const data = await response.json();
  return data.transactions || [];
}

export async function createTransaction(transaction: NewTransaction): Promise<Transaction> {
  const response = await fetch('/api/budget/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create transaction');
  }

  const data = await response.json();
  return data.transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const response = await fetch(`/api/budget/transactions/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete transaction');
  }
}
