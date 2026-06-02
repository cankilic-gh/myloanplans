"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { useBudgetStore } from "@/stores/useBudgetStore";
import type { RecurringExpense, Frequency } from "@/lib/local/types";
import { formatCurrency } from "@/lib/format";
import { Modal, ConfirmModal, FormField, Input, Select, Textarea, Badge, Skeleton } from "./ui";

const FREQ_LABELS: Record<Frequency, string> = {
  weekly_2: "Biweekly",
  monthly: "Monthly",
  semiannual: "Every 6 months",
  yearly: "Yearly",
};

const TODAY = new Date().toISOString().slice(0, 10);

interface RecurringFormState {
  name: string;
  amount: string;
  type: "income" | "expense";
  frequency: Frequency;
  nextDueDate: string;
  description: string;
  categoryId: string;
  accountId: string;
}

const emptyForm = (): RecurringFormState => ({
  name: "",
  amount: "",
  type: "expense",
  frequency: "monthly",
  nextDueDate: TODAY,
  description: "",
  categoryId: "",
  accountId: "",
});

function fromRecurring(r: RecurringExpense): RecurringFormState {
  return {
    name: r.name,
    amount: String(r.amount),
    type: r.type,
    frequency: r.frequency,
    nextDueDate: r.nextDueDate,
    description: r.description ?? "",
    categoryId: r.categoryId ?? "",
    accountId: r.accountId ?? "",
  };
}

type Filter = "all" | "income" | "expense";

export const RecurringSection: React.FC = () => {
  const hydrated = useBudgetStore((s) => s.hydrated);
  const recurring = useBudgetStore((s) => s.recurring);
  const categories = useBudgetStore((s) => s.categories);
  const accounts = useBudgetStore((s) => s.accounts);
  const addRecurring = useBudgetStore((s) => s.addRecurring);
  const updateRecurring = useBudgetStore((s) => s.updateRecurring);
  const deleteRecurring = useBudgetStore((s) => s.deleteRecurring);

  const [filter, setFilter] = useState<Filter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<RecurringFormState>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RecurringExpense | null>(null);

  const filtered = recurring.filter((r) => filter === "all" || r.type === filter);

  function openAdd() {
    setEditId(null);
    setForm(emptyForm());
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(r: RecurringExpense) {
    setEditId(r.id);
    setForm(fromRecurring(r));
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
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) { setFormError("Enter a valid amount."); return; }
    if (!form.nextDueDate) { setFormError("Next due date is required."); return; }

    const payload = {
      name: form.name.trim(),
      amount,
      type: form.type,
      frequency: form.frequency,
      nextDueDate: form.nextDueDate,
      description: form.description.trim() || null,
      categoryId: form.categoryId || null,
      accountId: form.accountId || null,
    };

    if (editId) {
      updateRecurring(editId, payload);
    } else {
      addRecurring(payload);
    }
    closeModal();
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteRecurring(deleteTarget.id);
    setDeleteTarget(null);
  }

  const filteredCategories = categories.filter((c) =>
    form.type === "income" ? c.type === "INCOME" : c.type === "EXPENSE"
  );

  if (!hydrated) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  return (
    <>
      {/* Filter + Add */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["all", "income", "expense"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`h-7 px-3 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === f
                ? f === "income"
                  ? "bg-mint/10 text-mint border border-mint/20"
                  : f === "expense"
                  ? "bg-rose/10 text-rose border border-rose/20"
                  : "bg-brand/10 text-brand border border-brand/20"
                : "bg-foreground/[0.04] text-muted hover:text-foreground border border-transparent"
            }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
        <button
          type="button"
          onClick={openAdd}
          className="ml-auto h-7 px-3 rounded-lg text-xs font-medium btn-brand flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <RefreshCw className="w-8 h-8 text-muted/40" />
          <p className="text-sm text-muted">No recurring {filter === "all" ? "items" : filter + "s"} yet.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto scroll-thin pr-0.5">
          <AnimatePresence initial={false}>
            {filtered.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-border-strong transition-all group"
              >
                <div
                  className={`w-2 h-10 rounded-full shrink-0 ${
                    r.type === "income" ? "bg-mint/50" : "bg-rose/50"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{r.name}</span>
                    <Badge variant={r.type === "income" ? "income" : "expense"}>{r.type}</Badge>
                    <Badge variant="neutral">{FREQ_LABELS[r.frequency]}</Badge>
                  </div>
                  <div className="text-xs text-muted mt-0.5">Due: {r.nextDueDate}</div>
                  {r.description && (
                    <div className="text-xs text-muted/60 truncate mt-0.5">{r.description}</div>
                  )}
                </div>
                <div className={`text-sm font-bold balance-num shrink-0 ${r.type === "income" ? "text-mint" : "text-rose"}`}>
                  {formatCurrency(r.amount)}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-foreground/[0.06] text-muted hover:text-foreground transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(r)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose/10 text-muted hover:text-rose transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editId ? "Edit Recurring Item" : "Add Recurring Item"}
        footer={
          <button type="submit" form="recurring-form" className="w-full h-10 rounded-xl btn-brand text-sm font-semibold">
            {editId ? "Update" : "Add"}
          </button>
        }
      >
        <form id="recurring-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex gap-1 bg-foreground/[0.04] rounded-xl p-1">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t, categoryId: "" }))}
                className={`flex-1 h-8 rounded-lg text-xs font-semibold capitalize transition-all ${
                  form.type === t
                    ? t === "income"
                      ? "bg-mint/10 text-mint border border-mint/20"
                      : "bg-rose/10 text-rose border border-rose/20"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <FormField label="Name">
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Rent, Salary…"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Amount ($)">
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                required
              />
            </FormField>
            <FormField label="Frequency">
              <Select
                value={form.frequency}
                onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as Frequency }))}
              >
                {Object.entries(FREQ_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Next Due Date">
            <Input
              type="date"
              value={form.nextDueDate}
              onChange={(e) => setForm((f) => ({ ...f, nextDueDate: e.target.value }))}
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category (optional)">
              <Select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">None</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Account (optional)">
              <Select
                value={form.accountId}
                onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
              >
                <option value="">None</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Description (optional)">
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional notes…"
            />
          </FormField>

          {formError && <p className="text-xs text-rose">{formError}</p>}
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Recurring Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
      />
    </>
  );
};
