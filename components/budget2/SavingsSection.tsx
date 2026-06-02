"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, PiggyBank, ChevronDown, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useBudgetStore } from "@/stores/useBudgetStore";
import type { SavingsGoal } from "@/lib/local/types";
import { goalWithProjections } from "@/lib/local/budget-calc";
import { formatCurrency } from "@/lib/format";
import { Modal, ConfirmModal, FormField, Input, Textarea, Badge, Skeleton } from "./ui";

const TODAY = new Date().toISOString().slice(0, 10);

interface GoalFormState {
  name: string;
  initialAmount: string;
  monthlyAmount: string;
  interestRate: string;
  projectionYears: string;
}

const emptyGoalForm = (): GoalFormState => ({
  name: "",
  initialAmount: "0",
  monthlyAmount: "0",
  interestRate: "4.5",
  projectionYears: "5",
});

function fromGoal(g: SavingsGoal): GoalFormState {
  return {
    name: g.name,
    initialAmount: String(g.initialAmount),
    monthlyAmount: String(g.monthlyAmount),
    interestRate: String(g.interestRate),
    projectionYears: String(g.projectionYears),
  };
}

interface ContribFormState {
  amount: string;
  date: string;
  note: string;
}

const emptyContribForm = (): ContribFormState => ({ amount: "", date: TODAY, note: "" });

// ---- Individual Goal Card ----

const GoalCard: React.FC<{
  goal: SavingsGoal;
  onEdit: (g: SavingsGoal) => void;
  onDelete: (g: SavingsGoal) => void;
}> = ({ goal, onEdit, onDelete }) => {
  const addContribution = useBudgetStore((s) => s.addContribution);
  const deleteContribution = useBudgetStore((s) => s.deleteContribution);

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showContributions, setShowContributions] = useState(false);
  const [contribOpen, setContribOpen] = useState(false);
  const [contribForm, setContribForm] = useState<ContribFormState>(emptyContribForm());
  const [contribError, setContribError] = useState<string | null>(null);

  const computed = useMemo(() => goalWithProjections(goal), [goal]);
  const { projections } = computed;

  const chartData = projections.yearlyBreakdown.map((yb) => ({
    year: `Y${yb.year}`,
    Balance: yb.balance,
  }));

  function handleAddContrib(e: React.FormEvent) {
    e.preventDefault();
    setContribError(null);
    const amount = parseFloat(contribForm.amount);
    if (isNaN(amount) || amount <= 0) { setContribError("Enter a valid amount."); return; }
    if (!contribForm.date) { setContribError("Date required."); return; }
    addContribution(goal.id, { amount, date: contribForm.date, note: contribForm.note.trim() || null });
    setContribForm(emptyContribForm());
    setContribOpen(false);
  }

  return (
    <div className="card-premium p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{goal.name}</div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <Badge variant="neutral">
              {goal.projectionYears}yr @ {goal.interestRate}%
            </Badge>
            <Badge variant="brand">
              +{formatCurrency(goal.monthlyAmount)}/mo
            </Badge>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-bold text-mint balance-num">
            {formatCurrency(projections.finalBalance)}
          </div>
          <div className="text-[10px] text-muted">in {goal.projectionYears} yrs</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-mint/[0.05] rounded-lg py-2 px-1">
          <div className="text-xs font-semibold balance-num text-mint">
            {formatCurrency(projections.totalContributions)}
          </div>
          <div className="text-[10px] text-muted">Contributions</div>
        </div>
        <div className="bg-lavender/[0.05] rounded-lg py-2 px-1">
          <div className="text-xs font-semibold balance-num text-lavender">
            {formatCurrency(projections.totalInterest)}
          </div>
          <div className="text-[10px] text-muted">Interest</div>
        </div>
        <div className="bg-brand/[0.05] rounded-lg py-2 px-1">
          <div className="text-xs font-semibold balance-num text-brand">
            {formatCurrency(goal.initialAmount)}
          </div>
          <div className="text-[10px] text-muted">Starting</div>
        </div>
      </div>

      {/* Mini chart */}
      {chartData.length > 1 && (
        <div className="mb-3" style={{ height: 72 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2bd4a4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2bd4a4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                formatter={(v) => [formatCurrency(Number(v)), "Balance"] as [string, string]}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  fontSize: "11px",
                }}
              />
              <Area
                type="monotone"
                dataKey="Balance"
                stroke="#2bd4a4"
                strokeWidth={2}
                fill={`url(#grad-${goal.id})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Year breakdown toggle */}
      {projections.yearlyBreakdown.length > 0 && (
        <button
          type="button"
          onClick={() => setShowBreakdown((v) => !v)}
          className="flex items-center gap-1 text-xs text-brand hover:text-brand/80 font-medium transition-colors mb-1"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showBreakdown ? "rotate-180" : ""}`} />
          {showBreakdown ? "Hide" : "View"} year-by-year
        </button>
      )}
      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 mb-2 max-h-40 overflow-y-auto scroll-thin pr-1">
              {projections.yearlyBreakdown.map((yb) => {
                const pct = projections.finalBalance > 0
                  ? Math.max((yb.balance / projections.finalBalance) * 100, 4)
                  : 4;
                return (
                  <div key={yb.year} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted w-10 shrink-0">Year {yb.year}</span>
                    <div className="flex-1 h-1.5 bg-foreground/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-mint/60 to-mint rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-foreground balance-num w-20 text-right shrink-0">
                      {formatCurrency(yb.balance)}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contributions */}
      {goal.contributions.length > 0 && (
        <button
          type="button"
          onClick={() => setShowContributions((v) => !v)}
          className="text-xs text-muted hover:text-foreground font-medium transition-colors mb-1 mt-1"
        >
          {showContributions ? "Hide" : `${goal.contributions.length}`} extra contribution{goal.contributions.length !== 1 ? "s" : ""}
        </button>
      )}
      <AnimatePresence>
        {showContributions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 mb-2 max-h-36 overflow-y-auto scroll-thin pr-1">
              {goal.contributions.map((c) => (
                <div key={c.id} className="flex items-center gap-2 py-1 px-2 bg-foreground/[0.02] rounded-lg text-xs">
                  <span className="text-muted shrink-0">{c.date}</span>
                  <span className="font-semibold text-mint balance-num shrink-0">+{formatCurrency(c.amount)}</span>
                  {c.note && <span className="text-muted/60 truncate flex-1">{c.note}</span>}
                  <button
                    type="button"
                    onClick={() => deleteContribution(goal.id, c.id)}
                    className="shrink-0 text-muted/40 hover:text-rose transition-colors"
                  >
                    <span className="sr-only">Delete</span>×
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add extra contribution form */}
      <AnimatePresence>
        {contribOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddContrib} className="mt-2 p-3 bg-mint/[0.04] border border-mint/20 rounded-xl space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <FormField label="Amount ($)">
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={contribForm.amount}
                    onChange={(e) => setContribForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    autoFocus
                  />
                </FormField>
                <FormField label="Date">
                  <Input
                    type="date"
                    value={contribForm.date}
                    onChange={(e) => setContribForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </FormField>
              </div>
              <FormField label="Note (optional)">
                <Input
                  value={contribForm.note}
                  onChange={(e) => setContribForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Bonus, gift…"
                />
              </FormField>
              {contribError && <p className="text-xs text-rose">{contribError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 h-8 rounded-xl bg-mint text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => { setContribOpen(false); setContribError(null); }}
                  className="flex-1 h-8 rounded-xl border border-border text-xs font-medium text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action row */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
        <button
          type="button"
          onClick={() => { setContribOpen((v) => !v); setContribError(null); }}
          className="h-7 px-2.5 rounded-lg text-xs font-medium bg-mint/10 text-mint border border-mint/20 hover:bg-mint/20 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Extra
        </button>
        <button
          type="button"
          onClick={() => onEdit(goal)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-foreground/[0.06] text-muted hover:text-foreground transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(goal)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose/10 text-muted hover:text-rose transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ---- SavingsSection root ----

export const SavingsSection: React.FC = () => {
  const hydrated = useBudgetStore((s) => s.hydrated);
  const savingsGoals = useBudgetStore((s) => s.savingsGoals);
  const addSavingsGoal = useBudgetStore((s) => s.addSavingsGoal);
  const updateSavingsGoal = useBudgetStore((s) => s.updateSavingsGoal);
  const deleteSavingsGoal = useBudgetStore((s) => s.deleteSavingsGoal);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormState>(emptyGoalForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavingsGoal | null>(null);

  function openAdd() {
    setEditId(null);
    setForm(emptyGoalForm());
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(g: SavingsGoal) {
    setEditId(g.id);
    setForm(fromGoal(g));
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditId(null);
    setFormError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim()) { setFormError("Name is required."); return; }
    const payload = {
      name: form.name.trim(),
      initialAmount: parseFloat(form.initialAmount) || 0,
      monthlyAmount: parseFloat(form.monthlyAmount) || 0,
      interestRate: parseFloat(form.interestRate) || 0,
      projectionYears: parseInt(form.projectionYears, 10) || 5,
    };
    if (editId) {
      updateSavingsGoal(editId, payload);
    } else {
      addSavingsGoal(payload);
    }
    closeModal();
  }

  if (!hydrated) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>;
  }

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <button
          type="button"
          onClick={openAdd}
          className="h-8 px-3 rounded-xl btn-brand text-xs font-semibold flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          New Goal
        </button>
      </div>

      {savingsGoals.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <PiggyBank className="w-8 h-8 text-muted/40" />
          <p className="text-sm text-muted">No savings goals yet.</p>
          <p className="text-xs text-muted/60">Track compound-interest growth toward any goal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingsGoals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Goal form modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editId ? "Edit Savings Goal" : "New Savings Goal"}
        footer={
          <button type="submit" form="goal-form" className="w-full h-10 rounded-xl btn-brand text-sm font-semibold">
            {editId ? "Update" : "Create Goal"}
          </button>
        }
      >
        <form id="goal-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Goal name">
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Emergency fund, vacation…"
              required
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Starting amount ($)">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.initialAmount}
                onChange={(e) => setForm((f) => ({ ...f, initialAmount: e.target.value }))}
                placeholder="0.00"
              />
            </FormField>
            <FormField label="Monthly deposit ($)">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.monthlyAmount}
                onChange={(e) => setForm((f) => ({ ...f, monthlyAmount: e.target.value }))}
                placeholder="0.00"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Annual rate (%)">
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.interestRate}
                onChange={(e) => setForm((f) => ({ ...f, interestRate: e.target.value }))}
                placeholder="4.5"
              />
            </FormField>
            <FormField label="Projection years">
              <Input
                type="number"
                min="1"
                max="50"
                step="1"
                value={form.projectionYears}
                onChange={(e) => setForm((f) => ({ ...f, projectionYears: e.target.value }))}
              />
            </FormField>
          </div>
          {formError && <p className="text-xs text-rose">{formError}</p>}
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) { deleteSavingsGoal(deleteTarget.id); setDeleteTarget(null); } }}
        title="Delete Savings Goal"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
      />
    </>
  );
};
