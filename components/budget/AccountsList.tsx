"use client";

import { useEffect, useState } from "react";
import { fetchAccounts, createAccount, type Account } from "@/lib/api/budget/accounts";

export default function AccountsList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountCurrency, setNewAccountCurrency] = useState("USD");
  const [addError, setAddError] = useState<string | null>(null);

  async function loadAccounts() {
    try {
      setLoading(true);
      const data = await fetchAccounts();
      setAccounts(data);
    } catch (err) {
      console.error("Error loading accounts:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
    const handleChange = () => loadAccounts();
    window.addEventListener("account-changed", handleChange);
    return () => window.removeEventListener("account-changed", handleChange);
  }, []);

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4">
        <div className="h-4 bg-slate-200 rounded w-32 mb-4 animate-pulse"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-slate-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bank Accounts</div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1 text-xs bg-slate-900 dark:bg-slate-700 text-white rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
          >
            Add Account
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {accounts.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">No accounts yet. Add your first account.</div>
          ) : (
            accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-3 border dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{acc.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Currency: {acc.currency}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add Account</h2>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewAccountName("");
                  setAddError(null);
                }}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Account name"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Currency</label>
                <select
                  value={newAccountCurrency}
                  onChange={(e) => setNewAccountCurrency(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              {addError && (
                <div className="text-xs text-red-600 dark:text-red-400">{addError}</div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewAccountName("");
                    setAddError(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!newAccountName.trim()) {
                      setAddError("Please enter an account name");
                      return;
                    }
                    try {
                      setAddError(null);
                      await createAccount({
                        name: newAccountName.trim(),
                        currency: newAccountCurrency,
                      });
                      setNewAccountName("");
                      await loadAccounts();
                      window.dispatchEvent(new CustomEvent("account-changed"));
                      setIsAddModalOpen(false);
                    } catch (err) {
                      setAddError(err instanceof Error ? err.message : "Failed to add account");
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



