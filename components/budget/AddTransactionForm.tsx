"use client";

import { useEffect, useState } from "react";
import { createTransaction } from "@/lib/api/budget/transactions";
import { fetchCategories, createCategory, type Category } from "@/lib/api/budget/categories";
import { fetchAccounts, type Account } from "@/lib/api/budget/accounts";

export default function AddTransactionForm() {
  const [amount, setAmount] = useState<string>("0");
  const [note, setNote] = useState<string>("");
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);

  async function loadCategories() {
    try {
      const rows = await fetchCategories();
      setCategories(rows);
      if (rows.length > 0 && !categoryId) {
        setCategoryId(rows[0].id);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  }

  async function loadAccounts() {
    try {
      const rows = await fetchAccounts();
      setAccounts(rows);
      if (rows.length > 0 && !accountId) {
        setAccountId(rows[0].id);
      }
    } catch (err) {
      console.error("Error loading accounts:", err);
    }
  }

  useEffect(() => {
    loadCategories();
    loadAccounts();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!accountId) {
        throw new Error("Please select an account");
      }

      console.log("[AddTransactionForm] Creating transaction with:", {
        accountId,
        categoryId,
        amount: parseFloat(amount),
        date: txDate,
        userEmail: typeof window !== 'undefined' ? sessionStorage.getItem('userEmail') : null,
      });

      const newTransaction = await createTransaction({
        accountId,
        categoryId: categoryId || null,
        amount: parseFloat(amount),
        currency: "USD",
        note: note || null,
        method: "card",
        date: txDate,
        source: "manual",
      });

      console.log("[AddTransactionForm] Transaction created successfully:", newTransaction);

      setAmount("0");
      setNote("");
      // Reload data - dispatch event to notify other components
      console.log("[AddTransactionForm] Dispatching transaction-changed event");
      window.dispatchEvent(new CustomEvent("transaction-changed"));
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("duplicate")) {
        setError("This transaction already exists with the same date, amount, note, and category.");
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Add transaction</div>
          <button
            type="button"
            onClick={() => setIsAddCategoryModalOpen(true)}
            className="px-3 py-1 text-xs bg-slate-900 dark:bg-slate-700 text-white rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
          >
            Add Categories
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="flex flex-col">
          <div className="flex flex-col space-y-3">
            {/* Account */}
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-300 mb-1">Account</label>
              <select
                value={accountId ?? ""}
                onChange={(e) => setAccountId(e.target.value || null)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
              >
                <option value="">Select account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">Categories</label>
              <select
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(e.target.value || null)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.type === "INCOME" ? "(income)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Fee (Amount) */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">Fee</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">Date</label>
              <input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </div>

            {/* Detail */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">Detail</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Transaction details..."
                className="w-full rounded-md border px-3 py-2 text-sm resize-none min-h-[80px]"
              />
            </div>

            {/* Add button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 text-sm disabled:opacity-60 hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
              >
                {loading ? "Adding…" : "Add"}
              </button>
              {error && <div className="mt-2 text-xs text-red-600 dark:text-red-400">Error: {error}</div>}
            </div>
          </div>
        </form>
      </div>

      {/* Add Category Modal */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Add Category</h2>
              <button
                type="button"
                onClick={() => {
                  setIsAddCategoryModalOpen(false);
                  setNewCategoryName("");
                  setAddCategoryError(null);
                }}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Type</label>
                <select
                  value={newCategoryType}
                  onChange={(e) => setNewCategoryType(e.target.value as "INCOME" | "EXPENSE")}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
                {addCategoryError && (
                <div className="text-xs text-red-600 dark:text-red-400">{addCategoryError}</div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddCategoryModalOpen(false);
                    setNewCategoryName("");
                    setAddCategoryError(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!newCategoryName.trim()) {
                      setAddCategoryError("Please enter a category name");
                      return;
                    }
                    try {
                      setAddCategoryError(null);
                      await createCategory({
                        name: newCategoryName.trim(),
                        type: newCategoryType,
                      });
                      setNewCategoryName("");
                      await loadCategories();
                      setIsAddCategoryModalOpen(false);
                    } catch (err) {
                      setAddCategoryError(err instanceof Error ? err.message : "Failed to add category");
                    }
                  }}
                  className="flex-1 px-4 py-2 text-sm bg-slate-900 dark:bg-slate-700 text-white rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

