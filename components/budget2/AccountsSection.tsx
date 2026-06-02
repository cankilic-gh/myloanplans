"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Building2 } from "lucide-react";
import { useBudgetStore } from "@/stores/useBudgetStore";
import type { BudgetAccount } from "@/lib/local/types";
import { Modal, ConfirmModal, FormField, Input, Select, Badge, Skeleton } from "./ui";

interface AccountFormState {
  name: string;
  currency: string;
}

const emptyForm = (): AccountFormState => ({ name: "", currency: "USD" });

export const AccountsSection: React.FC = () => {
  const hydrated = useBudgetStore((s) => s.hydrated);
  const accounts = useBudgetStore((s) => s.accounts);
  const addAccount = useBudgetStore((s) => s.addAccount);
  const deleteAccount = useBudgetStore((s) => s.deleteAccount);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AccountFormState>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BudgetAccount | null>(null);

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
    if (!form.name.trim()) { setFormError("Account name is required."); return; }
    addAccount(form.name.trim(), form.currency);
    closeModal();
  }

  if (!hydrated) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    );
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
          Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Building2 className="w-8 h-8 text-muted/40" />
          <p className="text-sm text-muted">No accounts yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {accounts.map((acc) => (
              <motion.div
                key={acc.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-border-strong transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-brand/[0.07] border border-brand/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{acc.name}</div>
                  <Badge variant="neutral">{acc.currency}</Badge>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(acc)}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose/10 text-muted hover:text-rose transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
        title="Add Account"
        maxWidth="max-w-sm"
        footer={
          <button type="submit" form="acct-form" className="w-full h-10 rounded-xl btn-brand text-sm font-semibold">
            Add Account
          </button>
        }
      >
        <form id="acct-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Account name" error={formError}>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Main Checking, Savings…"
              required
              autoFocus
            />
          </FormField>
          <FormField label="Currency">
            <Select
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
            >
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="CAD">CAD — Canadian Dollar</option>
            </Select>
          </FormField>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) { deleteAccount(deleteTarget.id); setDeleteTarget(null); }
        }}
        title="Delete Account"
        message={`Delete "${deleteTarget?.name}"? All transactions for this account will also be removed.`}
      />
    </>
  );
};
