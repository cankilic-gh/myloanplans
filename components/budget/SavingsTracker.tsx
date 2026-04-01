"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface YearlyBreakdown {
  year: number;
  balance: number;
}

interface SavingsGoal {
  id: string;
  name: string;
  initialAmount: number;
  monthlyContribution: number;
  annualInterestRate: number;
  projectionYears: number;
  yearlyBreakdown: YearlyBreakdown[];
  finalBalance: number;
  createdAt: string;
}

interface SavingsGoalFormData {
  name: string;
  initialAmount: number;
  monthlyContribution: number;
  annualInterestRate: number;
  projectionYears: number;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const emptyForm: SavingsGoalFormData = {
  name: "",
  initialAmount: 0,
  monthlyContribution: 0,
  annualInterestRate: 0,
  projectionYears: 5,
};

function GoalCard({
  goal,
  onEdit,
  onDelete,
}: {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const maxBalance =
    goal.yearlyBreakdown.length > 0
      ? Math.max(...goal.yearlyBreakdown.map((y) => y.balance))
      : goal.finalBalance;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-lg">
      {/* Header row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 truncate">
            {goal.name}
          </h3>
          <div className="text-lg font-bold text-emerald-600 mt-1">
            In {goal.projectionYears} years: {formatCurrency(goal.finalBalance)}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label={`Edit ${goal.name}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(goal.id)}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label={`Delete ${goal.name}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="text-xs text-slate-500 mb-3">
        Starting: {formatCurrency(goal.initialAmount)} | Monthly:{" "}
        {formatCurrency(goal.monthlyContribution)} | Rate: {goal.annualInterestRate}%
      </div>

      {/* Breakdown toggle */}
      {goal.yearlyBreakdown.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setShowBreakdown((prev) => !prev)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {showBreakdown ? "Hide breakdown" : "Show year-by-year"}
          </button>

          <AnimatePresence>
            {showBreakdown && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2">
                  {goal.yearlyBreakdown.map((yb) => {
                    const barWidth =
                      maxBalance > 0
                        ? Math.max((yb.balance / maxBalance) * 100, 4)
                        : 4;

                    return (
                      <div key={yb.year} className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-12 shrink-0">
                          Year {yb.year}
                        </span>
                        <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-700 w-20 text-right shrink-0">
                          {formatCurrency(yb.balance)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default function SavingsTracker() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SavingsGoalFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/budget/savings");
      if (!res.ok) {
        throw new Error(`Failed to fetch savings: ${res.status}`);
      }
      const json: SavingsGoal[] = await res.json();
      setGoals(json);
    } catch (err) {
      console.error("Error loading savings goals:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(goal: SavingsGoal) {
    setEditingId(goal.id);
    setForm({
      name: goal.name,
      initialAmount: goal.initialAmount,
      monthlyContribution: goal.monthlyContribution,
      annualInterestRate: goal.annualInterestRate,
      projectionYears: goal.projectionYears,
    });
    setFormError(null);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError("Please enter a goal name");
      return;
    }

    try {
      setSubmitting(true);
      const url = editingId
        ? `/api/budget/savings/${editingId}`
        : "/api/budget/savings";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Request failed: ${res.status}`);
      }

      cancelForm();
      await loadGoals();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleteConfirmId(id);
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;

    try {
      const res = await fetch(`/api/budget/savings/${deleteConfirmId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Delete failed: ${res.status}`);
      }
      setDeleteConfirmId(null);
      await loadGoals();
    } catch (err) {
      console.error("Error deleting savings goal:", err);
      setDeleteConfirmId(null);
    }
  }

  const deletingGoal = deleteConfirmId
    ? goals.find((g) => g.id === deleteConfirmId)
    : null;

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-slate-700">Savings Goals</div>
          <button
            type="button"
            onClick={openAddForm}
            className="px-3 py-1 text-xs bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            Add Goal
          </button>
        </div>

        {/* Inline form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleSubmit}
                className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3"
              >
                <div className="text-xs font-semibold text-slate-700 mb-1">
                  {editingId ? "Edit Goal" : "New Savings Goal"}
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Emergency fund, vacation, etc."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Initial Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.initialAmount || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          initialAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Monthly Contribution ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.monthlyContribution || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          monthlyContribution: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Annual Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={form.annualInterestRate || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          annualInterestRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      placeholder="4.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Projection Years
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={form.projectionYears}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          projectionYears: parseInt(e.target.value, 10) || 5,
                        })
                      }
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {formError && (
                  <div className="text-xs text-red-600">{formError}</div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors disabled:opacity-60"
                  >
                    {submitting
                      ? "Saving..."
                      : editingId
                      ? "Update"
                      : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="flex-1 px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals list */}
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-slate-500">
            Loading...
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 py-4">
            Unable to load savings goals. Please try again later.
          </div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-sm text-slate-500">
            <p>No savings goals yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Add a goal to start tracking your savings.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-lg md:rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Delete Savings Goal
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete &quot;{deletingGoal?.name}&quot;? This
              action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
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
