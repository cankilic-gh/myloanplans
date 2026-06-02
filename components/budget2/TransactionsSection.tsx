"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ListFilter, Receipt } from "lucide-react";
import { useBudgetStore } from "@/stores/useBudgetStore";
import { formatCurrency } from "@/lib/format";
import { ExportMenu } from "@/components/site/ExportMenu";
import { tableToCSV, tableToXLS } from "@/lib/export";
import { Modal, FormField, Input, Select, Badge, Skeleton } from "./ui";

type TxFilter = "ALL" | "INCOME" | "EXPENSE";

const TODAY = new Date().toISOString().slice(0, 10);

interface TxFormState {
  accountId: string;
  categoryId: string;
  amount: string;
  date: string;
  note: string;
  method: string;
}

const emptyForm = (defaultAccountId: string): TxFormState => ({
  accountId: defaultAccountId,
  categoryId: "",
  amount: "",
  date: TODAY,
  note: "",
  method: "card",
});

const TX_HEADERS = ["Date", "Account", "Category", "Type", "Amount", "Method", "Note"];

export const TransactionsSection: React.FC = () => {
  const hydrated = useBudgetStore((s) => s.hydrated);
  const transactions = useBudgetStore((s) => s.transactions);
  const categories = useBudgetStore((s) => s.categories);
  const accounts = useBudgetStore((s) => s.accounts);
  const addTransaction = useBudgetStore((s) => s.addTransaction);
  const deleteTransaction = useBudgetStore((s) => s.deleteTransaction);

  const [filter, setFilter] = useState<TxFilter>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<TxFormState>(emptyForm(accounts[0]?.id ?? ""));
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const catMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );
  const accMap = useMemo(
    () => new Map(accounts.map((a) => [a.id, a])),
    [accounts]
  );

  const filtered = useMemo(() => {
    const oneOffs = transactions.filter((t) => t.source !== "recurring");
    if (filter === "ALL") return oneOffs;
    return oneOffs.filter((t) => {
      const cat = t.categoryId ? catMap.get(t.categoryId) : null;
      return cat?.type === filter;
    });
  }, [transactions, filter, catMap]);

  const exportBody = useMemo(
    () =>
      filtered.map((t) => {
        const cat = t.categoryId ? catMap.get(t.categoryId) : null;
        const acc = accMap.get(t.accountId);
        return [
          t.date,
          acc?.name ?? "",
          cat?.name ?? "",
          cat?.type ?? "",
          t.amount,
          t.method ?? "",
          t.note ?? "",
        ];
      }),
    [filtered, catMap, accMap]
  );

  function openAdd() {
    setForm(emptyForm(accounts[0]?.id ?? ""));
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
    if (!form.accountId) { setFormError("Select an account."); return; }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) { setFormError("Enter a valid amount."); return; }
    addTransaction({
      accountId: form.accountId,
      categoryId: form.categoryId || null,
      amount,
      date: form.date,
      note: form.note.trim() || null,
      method: form.method || null,
      source: "manual",
    });
    closeModal();
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    deleteTransaction(id);
    setDeletingId(null);
  }

  if (!hydrated) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
      </div>
    );
  }

  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["ALL", "INCOME", "EXPENSE"] as TxFilter[]).map((f) => (
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
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <ExportMenu
            onCSV={() => tableToCSV(TX_HEADERS, exportBody, "transactions.csv")}
            onXLS={() => tableToXLS("Transactions", TX_HEADERS, exportBody, "transactions.xls")}
            align="right"
          />
          <button
            type="button"
            onClick={openAdd}
            className="h-8 px-3 rounded-xl btn-brand text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Receipt className="w-8 h-8 text-muted/40" />
          <p className="text-sm text-muted">No transactions found.</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-96 overflow-y-auto scroll-thin pr-0.5">
          <AnimatePresence initial={false}>
            {filtered.map((tx) => {
              const cat = tx.categoryId ? catMap.get(tx.categoryId) : null;
              const acc = accMap.get(tx.accountId);
              const isIncome = cat?.type === "INCOME";

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border hover:border-border-strong bg-card group transition-all"
                >
                  <div
                    className={`w-1.5 h-8 rounded-full shrink-0 ${isIncome ? "bg-mint/50" : cat ? "bg-rose/50" : "bg-muted/30"}`}
                  />
                  <div className="text-xs text-muted balance-num shrink-0 w-20">{tx.date}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {acc && <span className="text-xs text-muted/70">{acc.name}</span>}
                      {cat && <Badge variant={isIncome ? "income" : "expense"}>{cat.name}</Badge>}
                    </div>
                    {tx.note && (
                      <div className="text-[10px] text-muted/60 truncate">{tx.note}</div>
                    )}
                  </div>
                  {tx.method && (
                    <Badge variant="neutral">{tx.method}</Badge>
                  )}
                  <div className={`text-sm font-semibold balance-num shrink-0 ${isIncome ? "text-mint" : cat ? "text-rose" : "text-foreground"}`}>
                    {isIncome ? "+" : cat ? "-" : ""}{formatCurrency(tx.amount)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(tx.id)}
                    disabled={deletingId === tx.id}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose/10 text-muted hover:text-rose transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Add Transaction"
        footer={
          <button type="submit" form="tx-form" className="w-full h-10 rounded-xl btn-brand text-sm font-semibold">
            Add Transaction
          </button>
        }
      >
        <form id="tx-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Account">
              <Select
                value={form.accountId}
                onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
                required
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Category">
              <Select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">Uncategorized</option>
                <optgroup label="Income">
                  {incomeCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Expense">
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              </Select>
            </FormField>
          </div>
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
            <FormField label="Date">
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Method">
              <Select
                value={form.method}
                onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
              >
                <option value="card">Card</option>
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="check">Check</option>
                <option value="">Other</option>
              </Select>
            </FormField>
            <FormField label="Note (optional)">
              <Input
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Optional"
              />
            </FormField>
          </div>
          {formError && <p className="text-xs text-rose">{formError}</p>}
        </form>
      </Modal>
    </>
  );
};
