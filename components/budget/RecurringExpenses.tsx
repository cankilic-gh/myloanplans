"use client";

import { useEffect, useState } from "react";
import {
  fetchRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  type RecurringExpense,
  type Frequency,
  calculateNextDueDate,
} from "@/lib/api/budget/recurring";
import { fetchCategories, type Category } from "@/lib/api/budget/categories";
import { fetchAccounts, type Account } from "@/lib/api/budget/accounts";

export default function RecurringExpenses() {
  const [activeTab, setActiveTab] = useState<"expense" | "income" | "all">("all");
  const [items, setItems] = useState<RecurringExpense[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Form state
  const [formType, setFormType] = useState<"expense" | "income">("expense");
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formFrequency, setFormFrequency] = useState<Frequency>("monthly");
  const [formDescription, setFormDescription] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<string | null>(null);
  const [formAccountId, setFormAccountId] = useState<string | null>(null);
  const [formNextDueDate, setFormNextDueDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const data = await fetchRecurringExpenses(activeTab === "all" ? undefined : activeTab);
      setItems(data);
    } catch (err) {
      console.error("Error loading recurring expenses:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories(type?: "expense" | "income") {
    try {
      const allCategories = await fetchCategories();
      const categoryType = type || (activeTab === "all" ? "expense" : activeTab);
      const filtered = !categoryType
        ? allCategories 
        : allCategories.filter(c => c.type.toLowerCase() === categoryType);
      setCategories(filtered);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  }

  async function loadAccounts() {
    try {
      const rows = await fetchAccounts();
      setAccounts(rows);
      if (rows.length > 0 && !formAccountId) {
        setFormAccountId(rows[0].id);
      }
    } catch (err) {
      console.error("Error loading accounts:", err);
    }
  }

  useEffect(() => {
    loadData();
    loadCategories();
    loadAccounts();
  }, [activeTab]);

  function openAddModal() {
    setIsEditing(false);
    setSelectedId(null);
    setFormType(activeTab === "all" ? "expense" : activeTab);
    setFormName("");
    setFormAmount("");
    setFormFrequency("monthly");
    setFormDescription("");
    setFormCategoryId(null);
    setFormNextDueDate(new Date().toISOString().slice(0, 10));
    setFormError(null);
    loadCategories(activeTab === "all" ? "expense" : activeTab);
    setIsModalOpen(true);
  }

  function openEditModal(item: RecurringExpense) {
    setIsEditing(true);
    setSelectedId(item.id);
    setFormType(item.type);
    setFormName(item.name);
    setFormAmount(item.amount.toString());
    setFormFrequency(item.frequency);
    setFormDescription(item.description || "");
    setFormCategoryId(item.categoryId);
    setFormAccountId(item.accountId);
    setFormNextDueDate(item.nextDueDate);
    setFormError(null);
    loadCategories(item.type);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError("Please enter a name");
      return;
    }

    if (!formAmount || parseFloat(formAmount) <= 0) {
      setFormError("Please enter a valid amount");
      return;
    }

    if (!formNextDueDate) {
      setFormError("Please select a next due date");
      return;
    }

    try {
      if (isEditing && selectedId) {
        await updateRecurringExpense(selectedId, {
          name: formName,
          amount: parseFloat(formAmount),
          type: formType,
          frequency: formFrequency,
          description: formDescription || undefined,
          categoryId: formCategoryId || undefined,
          accountId: formAccountId || undefined,
          nextDueDate: formNextDueDate,
        });
      } else {
        await createRecurringExpense({
          name: formName,
          amount: parseFloat(formAmount),
          type: formType,
          frequency: formFrequency,
          description: formDescription || undefined,
          categoryId: formCategoryId || undefined,
          accountId: formAccountId || undefined,
          nextDueDate: formNextDueDate,
        });
      }

      closeModal();
      await loadData();
      window.dispatchEvent(new CustomEvent("transaction-changed"));
      window.dispatchEvent(new CustomEvent("recurring-changed"));
    } catch (err) {
      console.error("Error saving recurring expense:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setFormError(errorMessage || "An error occurred");
    }
  }

  function handleDelete() {
    setShowDeleteConfirm(true);
  }

  async function confirmDelete() {
    if (!selectedId) return;

    setShowDeleteConfirm(false);
    try {
      await deleteRecurringExpense(selectedId);
      closeModal();
      await loadData();
      window.dispatchEvent(new CustomEvent("transaction-changed"));
      window.dispatchEvent(new CustomEvent("recurring-changed"));
    } catch (err) {
      console.error("Error deleting recurring expense:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setFormError(errorMessage || "An error occurred");
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const frequencyLabels: Record<Frequency, string> = {
    weekly_2: "2 Weeks",
    monthly: "Monthly",
    semiannual: "6 Months",
    yearly: "Yearly",
  };

  const selectedItem = selectedId ? items.find((i) => i.id === selectedId) : null;

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4 h-full flex flex-col min-h-0">
        {/* Header with tabs */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recurring Expenses / Income</div>
            <button
              type="button"
              onClick={openAddModal}
              className="px-3 py-1 text-xs bg-slate-900 dark:bg-slate-700 text-white rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("all");
                setSelectedId(null);
                if (isModalOpen) closeModal();
              }}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === "all"
                  ? "bg-slate-900 dark:bg-slate-700 text-white border border-slate-900 dark:border-slate-700"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 border border-transparent"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("expense");
                setSelectedId(null);
                if (isModalOpen) closeModal();
              }}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === "expense"
                  ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 border border-transparent"
              }`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("income");
                setSelectedId(null);
                if (isModalOpen) closeModal();
              }}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === "income"
                  ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 border border-transparent"
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            No recurring {activeTab === "all" ? "items" : activeTab + "s"} yet.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`p-3 rounded-md border cursor-pointer transition-colors ${
                  selectedId === item.id
                    ? item.type === "expense"
                      ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800"
                      : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-800"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{item.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {frequencyLabels[item.frequency]} • Due: {item.nextDueDate}
                    </div>
                    {item.description && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">{item.description}</div>
                    )}
                  </div>
                  <div
                    className={`text-sm font-semibold ml-2 ${
                      item.type === "expense" ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {formatCurrency(item.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit button (only shown when item is selected) */}
        {selectedId && selectedItem && (
          <button
            type="button"
            onClick={() => openEditModal(selectedItem)}
            className="mt-4 px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {isEditing ? "Edit" : "Add"} Recurring {formType === "expense" ? "Expense" : "Income"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Type</label>
                <select
                  value={formType}
                  onChange={(e) => {
                    const newType = e.target.value as "expense" | "income";
                    setFormType(newType);
                    setFormCategoryId(null);
                    loadCategories(newType);
                  }}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Frequency</label>
                <select
                  value={formFrequency}
                  onChange={(e) => {
                    const freq = e.target.value as Frequency;
                    setFormFrequency(freq);
                    if (!isEditing && formNextDueDate) {
                      const nextDate = calculateNextDueDate(formNextDueDate, freq);
                      setFormNextDueDate(nextDate);
                    }
                  }}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="weekly_2">2 Weeks</option>
                  <option value="monthly">Monthly</option>
                  <option value="semiannual">6 Months</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Next Due Date</label>
                <input
                  type="date"
                  value={formNextDueDate}
                  onChange={(e) => setFormNextDueDate(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Category (optional)</label>
                <select
                  value={formCategoryId ?? ""}
                  onChange={(e) => setFormCategoryId(e.target.value || null)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {categories
                    .filter((cat) => cat.type.toLowerCase() === formType)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} {cat.type === "INCOME" ? "(income)" : ""}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Account (optional)</label>
                <select
                  value={formAccountId ?? ""}
                  onChange={(e) => setFormAccountId(e.target.value || null)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm resize-none"
                  rows={3}
                />
              </div>

              {formError && <div className="text-xs text-red-600 dark:text-red-400">{formError}</div>}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm bg-slate-900 dark:bg-slate-700 text-white rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                >
                  {isEditing ? "Update" : "Add"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Delete Recurring Item</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

