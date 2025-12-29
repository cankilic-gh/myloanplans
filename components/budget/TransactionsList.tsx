"use client";

import { useEffect, useState } from "react";
import { fetchTransactions, deleteTransaction, type Transaction } from "@/lib/api/budget/transactions";
import { fetchRecurringExpenses, type RecurringExpense } from "@/lib/api/budget/recurring";

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

// Combined transaction type that includes both regular transactions and recurring expenses
type CombinedTransaction = Transaction & {
  isRecurring?: boolean;
  recurringId?: string;
};

export default function TransactionsList() {
  const [rows, setRows] = useState<CombinedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "expense" | "income">("all");

  async function load() {
    try {
      setLoading(true);
      const filter = activeFilter === "all" ? undefined : activeFilter;
      console.log("[TransactionsList] Loading transactions with filter:", filter);
      
      // Fetch both transactions and recurring expenses
      const [transactions, recurringExpenses] = await Promise.all([
        fetchTransactions(100, filter),
        fetchRecurringExpenses(filter),
      ]);
      
      console.log("[TransactionsList] Fetched transactions:", transactions.length);
      console.log("[TransactionsList] Fetched recurring expenses:", recurringExpenses.length);
      
      // Convert recurring expenses to transaction-like format
      const recurringAsTransactions: CombinedTransaction[] = recurringExpenses.map((recurring) => {
        // Create a category-like object from recurring expense type
        const categoryType = recurring.type === "income" ? "INCOME" : "EXPENSE";
        
        console.log("[TransactionsList] Converting recurring expense:", {
          id: recurring.id,
          name: recurring.name,
          type: recurring.type,
          amount: recurring.amount,
          nextDueDate: recurring.nextDueDate,
          categoryId: recurring.categoryId,
          accountId: recurring.accountId,
        });
        
        return {
          id: `recurring-${recurring.id}`,
          userId: recurring.userId,
          accountId: recurring.accountId || "no-account", // Use placeholder if no account
          categoryId: recurring.categoryId,
          amount: recurring.amount,
          currency: "USD",
          note: recurring.description || `Recurring: ${recurring.name}`,
          method: null,
          date: recurring.nextDueDate, // Use nextDueDate as the transaction date
          source: "recurring",
          createdAt: recurring.createdAt,
          category: recurring.category ? {
            id: recurring.category.id,
            name: recurring.category.name,
            type: recurring.category.type,
          } : {
            // If no category, create a virtual one based on recurring type
            id: `virtual-${recurring.id}`,
            name: recurring.name,
            type: categoryType,
          },
          account: recurring.account ? {
            id: recurring.account.id,
            name: recurring.account.name,
          } : null,
          isRecurring: true,
          recurringId: recurring.id,
        };
      });
      
      console.log("[TransactionsList] Converted recurring expenses:", recurringAsTransactions.length, recurringAsTransactions);
      
      // Combine transactions and recurring expenses
      const allItems = [...transactions, ...recurringAsTransactions];
      
      // Sort by date (most recent first)
      allItems.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
      
      console.log("[TransactionsList] Combined items:", allItems.length);
      setRows(allItems);
      setError(null);
    } catch (err: unknown) {
      const errorMsg = errorMessage(err);
      console.error("[TransactionsList] Error loading items:", err, errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const handleChange = () => {
      console.log("[TransactionsList] Event received, reloading...");
      load();
    };
    window.addEventListener("transaction-changed", handleChange);
    window.addEventListener("recurring-changed", handleChange);
    return () => {
      window.removeEventListener("transaction-changed", handleChange);
      window.removeEventListener("recurring-changed", handleChange);
    };
  }, [activeFilter]);

  async function handleDelete(id: string) {
    setActionError(null);
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
      window.dispatchEvent(new CustomEvent("transaction-changed"));
    } catch (err: unknown) {
      setActionError(errorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-4 h-full flex flex-col min-h-0">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent transactions</div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              activeFilter === "all"
                ? "bg-slate-900 dark:bg-slate-700 text-white border border-slate-900 dark:border-slate-800"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-transparent"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("expense")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              activeFilter === "expense"
                ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-transparent"
            }`}
          >
            Expenses
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("income")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              activeFilter === "income"
                ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-transparent"
            }`}
          >
            Income
          </button>
        </div>
      </div>
      
      {loading && <div className="text-sm text-slate-500 dark:text-slate-300">Loading…</div>}
      {error && <div className="text-sm text-red-600 dark:text-red-400">Error: {error}</div>}
      {!loading && !error && rows.length === 0 && (
        <div className="text-sm text-slate-500 dark:text-slate-300">No transactions yet.</div>
      )}
      
      {!loading && !error && rows.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {rows.map((r) => {
              // Get category type - for recurring expenses, category should always exist (we create a virtual one)
              const categoryType = r.category?.type?.toLowerCase();
              
              return (
                <div
                  key={r.id}
                  className="group flex items-center justify-between p-2 border dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-600 dark:text-slate-300">{new Date(r.date).toISOString().slice(0, 10)}</span>
                      {r.isRecurring && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                          Recurring
                        </span>
                      )}
                      <span className={`font-medium ${
                        categoryType === "income" 
                          ? "text-emerald-600" 
                          : categoryType === "expense"
                          ? "text-red-600"
                          : "text-slate-600 dark:text-slate-300"
                      }`}>
                        {categoryType === "income" ? "+" : categoryType === "expense" ? "-" : ""}
                        {formatCurrency(r.amount, r.currency)}
                      </span>
                    </div>
                    {r.note && (
                      <div className="text-xs text-slate-500 dark:text-slate-300 mt-1 truncate">{r.note}</div>
                    )}
                  </div>
                  {!r.isRecurring && (
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id}
                      className="ml-2 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-opacity opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Delete transaction"
                    >
                      {deletingId === r.id ? "Deleting…" : "Delete"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {actionError && <div className="mt-2 text-xs text-red-600 dark:text-red-400">{actionError}</div>}
    </div>
  );
}

