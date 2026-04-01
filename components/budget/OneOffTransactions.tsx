"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createTransaction } from "@/lib/api/budget/transactions";
import {
  fetchTransactions,
  deleteTransaction,
  type Transaction,
} from "@/lib/api/budget/transactions";
import { fetchCategories, createCategory, type Category } from "@/lib/api/budget/categories";
import { fetchAccounts, type Account } from "@/lib/api/budget/accounts";

const formatCurrency = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function OneOffTransactions() {
  const [expanded, setExpanded] = useState(false);

  // Transaction list state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState<string>("0");
  const [note, setNote] = useState<string>("");
  const [txDate, setTxDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Add category modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<"INCOME" | "EXPENSE">(
    "EXPENSE"
  );
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    try {
      setListLoading(true);
      setListError(null);
      const all = await fetchTransactions(200);
      // Filter out recurring transactions
      const oneOffs = all.filter(
        (tx) =>
          tx.source !== "recurring" &&
          !(tx.note && tx.note.startsWith("Recurring:"))
      );
      setTransactions(oneOffs);
    } catch (err) {
      setListError(err instanceof Error ? err.message : String(err));
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const rows = await fetchCategories();
      setCategories(rows);
      if (rows.length > 0 && !categoryId) {
        setCategoryId(rows[0].id);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  }, []);

  const loadAccounts = useCallback(async () => {
    try {
      let rows = await fetchAccounts();
      if (rows.length === 0) {
        // Auto-create a default account
        const { createAccount } = await import("@/lib/api/budget/accounts");
        const newAcc = await createAccount({ name: "Main Account", currency: "USD" });
        rows = [newAcc];
      }
      setAccounts(rows);
      if (rows.length > 0 && !accountId) {
        setAccountId(rows[0].id);
      }
    } catch (err) {
      console.error("Error loading accounts:", err);
    }
  }, []);

  // Load data when expanded
  useEffect(() => {
    if (expanded) {
      loadTransactions();
      loadCategories();
      loadAccounts();
    }
  }, [expanded, loadTransactions, loadCategories, loadAccounts]);

  // Listen for refresh events
  useEffect(() => {
    const handleChange = () => {
      if (expanded) loadTransactions();
    };
    window.addEventListener("transaction-changed", handleChange);
    window.addEventListener("recurring-changed", handleChange);
    window.addEventListener("category-changed", handleChange);
    return () => {
      window.removeEventListener("transaction-changed", handleChange);
      window.removeEventListener("recurring-changed", handleChange);
      window.removeEventListener("category-changed", handleChange);
    };
  }, [expanded, loadTransactions]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      if (!accountId) {
        throw new Error("Please select an account");
      }

      await createTransaction({
        accountId,
        categoryId: categoryId || null,
        amount: parseFloat(amount),
        currency: "USD",
        note: note || null,
        method: "card",
        date: txDate,
        source: "manual",
      });

      setAmount("0");
      setNote("");
      window.dispatchEvent(new CustomEvent("transaction-changed"));
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("duplicate")) {
        setFormError(
          "This transaction already exists with the same date, amount, note, and category."
        );
      } else {
        setFormError(errMsg);
      }
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteTransaction(id: string) {
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      window.dispatchEvent(new CustomEvent("transaction-changed"));
    } catch (err) {
      console.error("Error deleting transaction:", err);
    } finally {
      setDeletingId(null);
    }
  }

  const transactionCount = transactions.length;

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden">
        {/* Collapsible header */}
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">
              One-Off Transactions
            </span>
            {!expanded && transactionCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-500 rounded">
                {transactionCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!expanded && (
              <span
                className="px-2 py-0.5 text-xs text-slate-500 hover:text-slate-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(true);
                }}
              >
                + Add
              </span>
            )}
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {/* Expandable body */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-slate-100 p-4 space-y-4">
                {/* Compact add form */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold text-slate-700">
                      Add transaction
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="px-2 py-0.5 text-[10px] bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors"
                    >
                      Add Category
                    </button>
                  </div>
                  <form onSubmit={onSubmit} className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">
                          Account
                        </label>
                        <select
                          value={accountId ?? ""}
                          onChange={(e) => setAccountId(e.target.value || null)}
                          className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                          required
                        >
                          <option value="">Select</option>
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">
                          Category
                        </label>
                        <select
                          value={categoryId ?? ""}
                          onChange={(e) =>
                            setCategoryId(e.target.value || null)
                          }
                          className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                        >
                          <option value="">None</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}{" "}
                              {c.type === "INCOME" ? "(income)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">
                          Amount
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">
                          Date
                        </label>
                        <input
                          type="date"
                          value={txDate}
                          onChange={(e) => setTxDate(e.target.value)}
                          className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">
                        Note
                      </label>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Optional note..."
                        className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="w-full rounded-md bg-slate-900 text-white px-3 py-1.5 text-xs disabled:opacity-60 hover:bg-slate-800 transition-colors"
                    >
                      {formLoading ? "Adding..." : "Add Transaction"}
                    </button>
                    {formError && (
                      <div className="text-[10px] text-red-600">
                        {formError}
                      </div>
                    )}
                  </form>
                </div>

                {/* Transaction list */}
                {listLoading ? (
                  <div className="text-xs text-slate-500 text-center py-4">
                    Loading...
                  </div>
                ) : listError ? (
                  <div className="text-xs text-red-600 text-center py-4">
                    Error: {listError}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-4">
                    No one-off transactions yet.
                  </div>
                ) : (
                  <div
                    className="space-y-1.5 max-h-[300px] overflow-y-auto"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(148,163,184,0.3) transparent",
                    }}
                  >
                    {transactions.map((tx) => {
                      const categoryType =
                        tx.category?.type?.toLowerCase();

                      return (
                        <div
                          key={tx.id}
                          className="group flex items-center justify-between p-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-500">
                                {new Date(tx.date)
                                  .toISOString()
                                  .slice(0, 10)}
                              </span>
                              <span
                                className={`font-medium ${
                                  categoryType === "income"
                                    ? "text-emerald-600"
                                    : categoryType === "expense"
                                    ? "text-red-600"
                                    : "text-slate-600"
                                }`}
                              >
                                {categoryType === "income"
                                  ? "+"
                                  : categoryType === "expense"
                                  ? "-"
                                  : ""}
                                {formatCurrency(tx.amount, tx.currency)}
                              </span>
                              {tx.category && (
                                <span className="text-slate-400 truncate">
                                  {tx.category.name}
                                </span>
                              )}
                            </div>
                            {tx.note && (
                              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                                {tx.note}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(tx.id)}
                            disabled={deletingId === tx.id}
                            className="ml-2 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-red-600 transition-opacity opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Delete transaction"
                          >
                            {deletingId === tx.id ? "..." : "Delete"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-lg md:rounded-lg p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Add Category
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName("");
                  setAddCategoryError(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Type
                </label>
                <select
                  value={newCategoryType}
                  onChange={(e) =>
                    setNewCategoryType(
                      e.target.value as "INCOME" | "EXPENSE"
                    )
                  }
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              {addCategoryError && (
                <div className="text-xs text-red-600">{addCategoryError}</div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewCategoryName("");
                    setAddCategoryError(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
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
                      setShowCategoryModal(false);
                      window.dispatchEvent(
                        new CustomEvent("category-changed")
                      );
                    } catch (err) {
                      setAddCategoryError(
                        err instanceof Error
                          ? err.message
                          : "Failed to add category"
                      );
                    }
                  }}
                  className="flex-1 px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
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
