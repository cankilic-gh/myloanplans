// Local-first data model (no backend, no auth).
// All data lives in the browser (localStorage). Clearing cache clears data.

export type CategoryType = "INCOME" | "EXPENSE";
export type RecurringType = "income" | "expense";
export type Frequency = "weekly_2" | "monthly" | "semiannual" | "yearly";

export interface BudgetAccount {
  id: string;
  name: string;
  currency: string; // default "USD"
  createdAt: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  type: CategoryType;
  budgetLimit?: number | null;
  createdAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId?: string | null;
  amount: number; // always positive
  currency: string;
  note?: string | null;
  method?: string | null;
  date: string; // YYYY-MM-DD
  source: string; // "manual" | "csv" | "recurring"
  createdAt: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number; // always positive
  type: RecurringType;
  frequency: Frequency;
  description?: string | null;
  categoryId?: string | null;
  accountId?: string | null;
  nextDueDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface SavingsContribution {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string | null;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  initialAmount: number;
  monthlyAmount: number;
  interestRate: number; // annual %
  projectionYears: number;
  contributions: SavingsContribution[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetData {
  accounts: BudgetAccount[];
  categories: BudgetCategory[];
  transactions: Transaction[];
  recurring: RecurringExpense[];
  savingsGoals: SavingsGoal[];
}

export const emptyBudgetData = (): BudgetData => ({
  accounts: [],
  categories: [],
  transactions: [],
  recurring: [],
  savingsGoals: [],
});
