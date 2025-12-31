// API client for loan plans

export interface LoanPlanData {
  id?: string;
  name: string;
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  downPayment?: number | null;
  recurringExtraPayment?: number | null;
  startDate?: string;
  oneTimePayments?: Record<string, number>;
  paidMonths?: number;
}

export interface LoanPlan extends LoanPlanData {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Helper to get user email from session
function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('userEmail');
}

// Fetch all loan plans for the authenticated user
export async function fetchLoanPlans(): Promise<LoanPlan[]> {
  const userEmail = getUserEmail();
  
  if (!userEmail) {
    throw new Error('User not authenticated');
  }

  const response = await fetch('/api/loan-plans', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch loan plans');
  }

  const data = await response.json();
  return data.plans;
}

// Create a new loan plan
export async function createLoanPlan(planData: LoanPlanData): Promise<LoanPlan> {
  const userEmail = getUserEmail();
  
  if (!userEmail) {
    throw new Error('User not authenticated');
  }

  const response = await fetch('/api/loan-plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
    body: JSON.stringify(planData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create loan plan');
  }

  const data = await response.json();
  return data.plan;
}

// Update an existing loan plan
export async function updateLoanPlan(id: string, planData: Partial<LoanPlanData>): Promise<LoanPlan> {
  const userEmail = getUserEmail();
  
  if (!userEmail) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`/api/loan-plans/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
    body: JSON.stringify(planData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update loan plan');
  }

  const data = await response.json();
  return data.plan;
}

// Delete a loan plan
export async function deleteLoanPlan(id: string): Promise<void> {
  const userEmail = getUserEmail();
  
  if (!userEmail) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`/api/loan-plans/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete loan plan');
  }
}




