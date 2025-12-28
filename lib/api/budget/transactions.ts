// API client for budget transactions

function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('userEmail');
}

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
  const userEmail = getUserEmail();
  
  if (!userEmail) {
    throw new Error('User not authenticated');
  }

  const params = new URLSearchParams();
  params.set('limit', limit.toString());
  if (filter) {
    params.set('filter', filter);
  }

  console.log("[API Client] Fetching transactions:", {
    url: `/api/budget/transactions?${params.toString()}`,
    userEmail,
    limit,
    filter,
  });

  const response = await fetch(`/api/budget/transactions?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
  });

  console.log("[API Client] Response status:", response.status, response.statusText);

  if (!response.ok) {
    const error = await response.json();
    console.error("[API Client] Error response:", error);
    throw new Error(error.error || 'Failed to fetch transactions');
  }

  const data = await response.json();
  console.log("[API Client] Response data:", {
    transactionCount: data.transactions?.length || 0,
    transactions: data.transactions,
  });
  return data.transactions || [];
}

export async function createTransaction(transaction: NewTransaction): Promise<Transaction> {
  const userEmail = getUserEmail();
  
  if (!userEmail) {
    console.error("[API Client] createTransaction - No user email found");
    throw new Error('User not authenticated');
  }

  console.log("[API Client] Creating transaction:", {
    userEmail,
    transaction,
  });

  const response = await fetch('/api/budget/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
    body: JSON.stringify(transaction),
  });

  console.log("[API Client] createTransaction response status:", response.status, response.statusText);

  if (!response.ok) {
    const error = await response.json();
    console.error("[API Client] createTransaction error:", error);
    throw new Error(error.error || 'Failed to create transaction');
  }

  const data = await response.json();
  console.log("[API Client] createTransaction success:", data.transaction);
  return data.transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const userEmail = getUserEmail();
  
  if (!userEmail) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`/api/budget/transactions/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete transaction');
  }
}

