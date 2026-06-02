"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Tag } from "lucide-react";
import { useBudgetStore } from "@/stores/useBudgetStore";
import type { BudgetCategory, CategoryType } from "@/lib/local/types";
import { Modal, ConfirmModal, FormField, Input, Select, Badge, Skeleton } from "./ui";

type Filter = "all" | "INCOME" | "EXPENSE";

interface CatFormState {
  name: string;
  type: CategoryType;
  budgetLimit: string;
}

const emptyForm = (): CatFormState => ({ name: "", type: "EXPENSE", budgetLimit: "" });

export const CategoriesSection: React.FC = () => {
  const hydrated = useBudgetStore((s) => s.hydrated);
  const categories = useBudgetStore((s) => s.categories);
  const addCategory = useBudgetStore((s) => s.addCategory);
  const deleteCategory = useBudgetStore((s) => s.deleteCategory);

  const [filter, setFilter] = useState<Filter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CatFormState>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BudgetCategory | null>(null);

  const filtered =
    filter === "all" ? categories : categories.filter((c) => c.type === filter);

  function openAdd() {
    setForm(emptyForm());
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setFormError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim()) { setFormError("Name is required."); return; }
    const limit = form.budgetLimit ? parseFloat(form.budgetLimit) : null;
    addCategory(form.name.trim(), form.type, limit);
    closeModal();
  }

  if (!hydrated) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["all", "INCOME", "EXPENSE"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`h-7 px-3 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === f
                ? f === "INCOME"
                  ? "bg-mint/10 text-mint border border-mint/20"
                  : f === "EXPENSE"
                  ? "bg-rose/10 text-rose border border-rose/20"
                  : "bg-brand/10 text-brand border border-brand/20"
                : "bg-foreground/[0.04] text-muted hover:text-foreground border border-transparent"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
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
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Tag className="w-7 h-7 text-muted/40" />
          <p className="text-sm text-muted">No categories yet.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto scroll-thin">
          <AnimatePresence initial={false}>
            {filtered.map((cat) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className={`flex items-center gap-2 pl-3 pr-1 py-1 rounded-xl border text-xs font-medium group ${
                  cat.type === "INCOME"
                    ? "bg-mint/[0.04] border-mint/20 text-mint"
                    : "bg-rose/[0.04] border-rose/20 text-rose"
                }`}
              >
                <span>{cat.name}</span>
                {cat.budgetLimit != null && cat.budgetLimit > 0 && (
                  <span className="text-[10px] opacity-60">${cat.budgetLimit}</span>
                )}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(cat)}
                  className="w-5 h-5 rounded-lg flex items-center justify-center hover:bg-foreground/10 transition-colors opacity-50 hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Add Category"
        maxWidth="max-w-sm"
        footer={
          <button type="submit" form="cat-form" className="w-full h-10 rounded-xl btn-brand text-sm font-semibold">
            Add Category
          </button>
        }
      >
        <form id="cat-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" error={formError}>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Groceries, Salary…"
              required
              autoFocus
            />
          </FormField>
          <FormField label="Type">
            <Select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CategoryType }))}
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </Select>
          </FormField>
          <FormField label="Budget limit (optional)">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.budgetLimit}
              onChange={(e) => setForm((f) => ({ ...f, budgetLimit: e.target.value }))}
              placeholder="Leave blank for no limit"
            />
          </FormField>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) { deleteCategory(deleteTarget.id); setDeleteTarget(null); }
        }}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? Transactions using this category will become uncategorized.`}
      />
    </>
  );
};
