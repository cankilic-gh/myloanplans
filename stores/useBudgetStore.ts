"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BudgetData,
  BudgetAccount,
  BudgetCategory,
  Transaction,
  RecurringExpense,
  SavingsGoal,
  SavingsContribution,
  CategoryType,
} from "@/lib/local/types";
import { emptyBudgetData } from "@/lib/local/types";
import { uid, today, nowISO } from "@/lib/local/uid";

interface BudgetState extends BudgetData {
  hydrated: boolean;
  setHydrated: () => void;

  // Accounts
  addAccount: (name: string, currency?: string) => BudgetAccount;
  deleteAccount: (id: string) => void;

  // Categories
  addCategory: (name: string, type: CategoryType, budgetLimit?: number | null) => BudgetCategory;
  ensureCategory: (name: string, type: CategoryType) => BudgetCategory;
  deleteCategory: (id: string) => void;

  // Transactions
  addTransaction: (tx: Omit<Transaction, "id" | "createdAt" | "currency"> & { currency?: string }) => Transaction;
  addTransactionsBatch: (
    accountId: string,
    items: Array<{ amount: number; date: string; categoryName: string; categoryType: CategoryType; note?: string | null; method?: string | null }>
  ) => { created: number; newCategories: string[] };
  deleteTransaction: (id: string) => void;

  // Recurring
  addRecurring: (r: Omit<RecurringExpense, "id" | "createdAt">) => RecurringExpense;
  updateRecurring: (id: string, patch: Partial<RecurringExpense>) => void;
  deleteRecurring: (id: string) => void;

  // Savings
  addSavingsGoal: (g: Partial<SavingsGoal> & { name: string }) => SavingsGoal;
  updateSavingsGoal: (id: string, patch: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  addContribution: (goalId: string, c: Omit<SavingsContribution, "id" | "createdAt">) => void;
  deleteContribution: (goalId: string, contributionId: string) => void;

  resetAll: () => void;
  importData: (data: BudgetData) => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      ...emptyBudgetData(),
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),

      addAccount: (name, currency = "USD") => {
        const account: BudgetAccount = { id: uid("acct"), name, currency, createdAt: nowISO() };
        set((s) => ({ accounts: [...s.accounts, account] }));
        return account;
      },
      deleteAccount: (id) =>
        set((s) => ({
          accounts: s.accounts.filter((a) => a.id !== id),
          transactions: s.transactions.filter((t) => t.accountId !== id),
        })),

      addCategory: (name, type, budgetLimit = null) => {
        const category: BudgetCategory = { id: uid("cat"), name, type, budgetLimit, createdAt: nowISO() };
        set((s) => ({ categories: [...s.categories, category] }));
        return category;
      },
      ensureCategory: (name, type) => {
        const existing = get().categories.find(
          (c) => c.name.toLowerCase() === name.toLowerCase() && c.type === type
        );
        if (existing) return existing;
        return get().addCategory(name, type);
      },
      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          transactions: s.transactions.map((t) =>
            t.categoryId === id ? { ...t, categoryId: null } : t
          ),
        })),

      addTransaction: (tx) => {
        const transaction: Transaction = {
          ...tx,
          id: uid("tx"),
          currency: tx.currency ?? "USD",
          source: tx.source ?? "manual",
          createdAt: nowISO(),
        };
        set((s) => ({ transactions: [transaction, ...s.transactions] }));
        return transaction;
      },
      addTransactionsBatch: (accountId, items) => {
        const newCategories: string[] = [];
        const created: Transaction[] = [];
        // Work on a local copy so ensureCategory dedupes within the batch
        let cats = [...get().categories];
        const ensure = (name: string, type: CategoryType): BudgetCategory => {
          const found = cats.find(
            (c) => c.name.toLowerCase() === name.toLowerCase() && c.type === type
          );
          if (found) return found;
          const cat: BudgetCategory = { id: uid("cat"), name, type, budgetLimit: null, createdAt: nowISO() };
          cats = [...cats, cat];
          newCategories.push(name);
          return cat;
        };
        for (const it of items) {
          const cat = ensure(it.categoryName, it.categoryType);
          created.push({
            id: uid("tx"),
            accountId,
            categoryId: cat.id,
            amount: Math.abs(it.amount),
            currency: "USD",
            note: it.note ?? null,
            method: it.method ?? null,
            date: it.date,
            source: "csv",
            createdAt: nowISO(),
          });
        }
        set((s) => ({
          categories: cats,
          transactions: [...created, ...s.transactions],
        }));
        return { created: created.length, newCategories };
      },
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      addRecurring: (r) => {
        const rec: RecurringExpense = { id: uid("rec"), createdAt: nowISO(), ...r };
        set((s) => ({ recurring: [...s.recurring, rec] }));
        return rec;
      },
      updateRecurring: (id, patch) =>
        set((s) => ({
          recurring: s.recurring.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      deleteRecurring: (id) =>
        set((s) => ({ recurring: s.recurring.filter((r) => r.id !== id) })),

      addSavingsGoal: (g) => {
        const goal: SavingsGoal = {
          id: uid("goal"),
          name: g.name,
          initialAmount: g.initialAmount ?? 0,
          monthlyAmount: g.monthlyAmount ?? 0,
          interestRate: g.interestRate ?? 0,
          projectionYears: g.projectionYears ?? 5,
          contributions: [],
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((s) => ({ savingsGoals: [goal, ...s.savingsGoals] }));
        return goal;
      },
      updateSavingsGoal: (id, patch) =>
        set((s) => ({
          savingsGoals: s.savingsGoals.map((g) =>
            g.id === id ? { ...g, ...patch, updatedAt: nowISO() } : g
          ),
        })),
      deleteSavingsGoal: (id) =>
        set((s) => ({ savingsGoals: s.savingsGoals.filter((g) => g.id !== id) })),
      addContribution: (goalId, c) =>
        set((s) => ({
          savingsGoals: s.savingsGoals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  updatedAt: nowISO(),
                  contributions: [
                    { id: uid("contrib"), createdAt: nowISO(), ...c },
                    ...g.contributions,
                  ],
                }
              : g
          ),
        })),
      deleteContribution: (goalId, contributionId) =>
        set((s) => ({
          savingsGoals: s.savingsGoals.map((g) =>
            g.id === goalId
              ? { ...g, contributions: g.contributions.filter((x) => x.id !== contributionId) }
              : g
          ),
        })),

      resetAll: () => set({ ...emptyBudgetData() }),
      importData: (data) => set({ ...data }),
    }),
    {
      name: "mlp_budget_v1",
      onRehydrateStorage: () => (state) => state?.setHydrated(),
      partialize: (s) => ({
        accounts: s.accounts,
        categories: s.categories,
        transactions: s.transactions,
        recurring: s.recurring,
        savingsGoals: s.savingsGoals,
      }),
    }
  )
);

export { today };
