// API client for budget accounts

export interface Account {
  id: string;
  userId: string;
  name: string;
  currency: string;
  createdAt: string;
}

export interface NewAccount {
  name: string;
  currency?: string;
}

export async function fetchAccounts(): Promise<Account[]> {
  const response = await fetch('/api/budget/accounts', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch accounts');
  }

  const data = await response.json();
  return data.accounts;
}

export async function createAccount(account: NewAccount): Promise<Account> {
  const response = await fetch('/api/budget/accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(account),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create account');
  }

  const data = await response.json();
  return data.account;
}
