"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle, ChevronRight, FileText } from "lucide-react";
import { parseCSV, mergeParsedResults } from "@/lib/csv/parser";
import type { ParsedCsvResult } from "@/lib/csv/types";
import { useBudgetStore } from "@/stores/useBudgetStore";
import { formatCurrency } from "@/lib/format";
import { Modal, FormField, Select, Badge } from "./ui";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = "upload" | "preview" | "result";

interface CsvFile {
  name: string;
  result: ParsedCsvResult;
}

interface ImportResult {
  created: number;
  newCategories: string[];
}

export const CsvImportModal: React.FC<Props> = ({ open, onClose }) => {
  const accounts = useBudgetStore((s) => s.accounts);
  const addTransactionsBatch = useBudgetStore((s) => s.addTransactionsBatch);

  const [step, setStep] = useState<Step>("upload");
  const [csvFiles, setCsvFiles] = useState<CsvFile[]>([]);
  const [merged, setMerged] = useState<ParsedCsvResult | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("upload");
    setCsvFiles([]);
    setMerged(null);
    setSelectedAccountId(accounts[0]?.id ?? "");
    setSaving(false);
    setImportResult(null);
    setError(null);
    setShowAll(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  const processFiles = useCallback(
    (files: File[]) => {
      setError(null);
      const newParsed: CsvFile[] = [];
      let err: string | null = null;

      for (const file of files) {
        if (!file.name.toLowerCase().endsWith(".csv")) {
          err = "Only .csv files are supported.";
          continue;
        }
        // Synchronous read via FileReader
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const result = parseCSV(text);
            newParsed.push({ name: file.name, result });
            const updated = [...csvFiles, ...newParsed];
            setCsvFiles(updated);
            setMerged(mergeParsedResults(updated.map((f) => f.result)));
            setStep("preview");
          } catch (parseErr) {
            setError(parseErr instanceof Error ? parseErr.message : "Failed to parse file.");
          }
        };
        reader.readAsText(file);
      }
      if (err) setError(err);
    },
    [csvFiles]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    processFiles(Array.from(e.dataTransfer.files));
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) processFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(i: number) {
    const updated = csvFiles.filter((_, idx) => idx !== i);
    setCsvFiles(updated);
    if (updated.length === 0) {
      setMerged(null);
      setStep("upload");
    } else {
      setMerged(mergeParsedResults(updated.map((f) => f.result)));
    }
  }

  function handleImport() {
    if (!selectedAccountId || !merged) return;
    setSaving(true);
    setError(null);
    try {
      const result = addTransactionsBatch(
        selectedAccountId,
        merged.transactions.map((t) => ({
          amount: t.amount,
          date: t.date,
          categoryName: t.categoryName,
          categoryType: t.type,
          note: t.description,
          method: t.method,
        }))
      );
      setImportResult({ created: result.created, newCategories: result.newCategories });
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setSaving(false);
    }
  }

  const PREVIEW_LIMIT = 8;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === "result" ? "Import Complete" : "Import CSV Transactions"}
      maxWidth="max-w-2xl"
      footer={
        step === "preview" ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={saving || !selectedAccountId}
              className="flex-1 h-10 rounded-xl btn-brand text-sm font-semibold disabled:opacity-50"
            >
              {saving ? "Importing…" : `Import ${merged?.transactions.length ?? 0} transactions`}
            </button>
          </div>
        ) : step === "result" ? (
          <button
            type="button"
            onClick={handleClose}
            className="w-full h-10 rounded-xl btn-brand text-sm font-semibold"
          >
            Done
          </button>
        ) : null
      }
    >
      <AnimatePresence mode="wait">
        {/* ---- UPLOAD ---- */}
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-brand bg-brand/[0.04]"
                  : "border-border hover:border-border-strong hover:bg-foreground/[0.02]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                  dragOver ? "bg-brand/10" : "bg-foreground/[0.05]"
                }`}>
                  <Upload className={`w-6 h-6 ${dragOver ? "text-brand" : "text-muted"}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Drop your CSV file here or click to browse
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Supports Chase Bank &amp; Chase Credit Card statements
                  </p>
                </div>
              </div>
            </div>
            {error && (
              <div className="mt-3 p-3 bg-rose/[0.05] border border-rose/20 rounded-xl text-sm text-rose">
                {error}
              </div>
            )}
          </motion.div>
        )}

        {/* ---- PREVIEW ---- */}
        {step === "preview" && merged && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-5"
          >
            {/* Files */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">Files</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-brand hover:text-brand/80 font-medium transition-colors"
                >
                  + Add more
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept=".csv" multiple onChange={handleFileInput} className="hidden" />
              {csvFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-foreground/[0.03] rounded-xl px-3 py-2">
                  <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    f.result.format === "BANK" ? "bg-brand/10 text-brand" : "bg-lavender/10 text-lavender"
                  }`}>
                    {f.result.format === "BANK" ? "BANK" : "CC"}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-muted shrink-0" />
                    <span className="text-sm text-foreground truncate">{f.name}</span>
                    <span className="text-xs text-muted shrink-0">{f.result.transactions.length} tx</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-rose/10 text-muted hover:text-rose transition-colors shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-foreground/[0.03] rounded-xl p-3 text-center">
                <div className="text-xs text-muted mb-1">Transactions</div>
                <div className="text-lg font-bold balance-num">{merged.transactions.length}</div>
              </div>
              <div className="bg-mint/[0.05] rounded-xl p-3 text-center">
                <div className="text-xs text-mint mb-1">Income</div>
                <div className="text-lg font-bold text-mint balance-num">{formatCurrency(merged.totalIncome)}</div>
              </div>
              <div className="bg-rose/[0.05] rounded-xl p-3 text-center">
                <div className="text-xs text-rose mb-1">Expenses</div>
                <div className="text-lg font-bold text-rose balance-num">{formatCurrency(merged.totalExpense)}</div>
              </div>
            </div>

            {/* Account selector */}
            <FormField label="Import to account">
              <Select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                required
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                ))}
              </Select>
            </FormField>

            {/* Category groups */}
            <div>
              <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">By Category</div>
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-foreground/[0.02]">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Category</th>
                      <th className="text-center px-3 py-2 text-xs font-semibold text-muted">Count</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-muted">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {merged.categoryGroups.map((g) => (
                      <tr key={g.name} className="border-b border-border/50 last:border-0">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${g.type === "INCOME" ? "bg-mint" : "bg-rose"}`} />
                            <span className="text-xs text-foreground">{g.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center text-xs text-muted balance-num">{g.count}</td>
                        <td className={`px-3 py-2 text-right text-xs font-semibold balance-num ${g.total >= 0 ? "text-mint" : "text-rose"}`}>
                          {formatCurrency(Math.abs(g.total))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* All transactions preview */}
            <div>
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground font-medium transition-colors"
              >
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAll ? "rotate-90" : ""}`} />
                {showAll ? "Hide" : "View"} all transactions
              </button>
              <AnimatePresence>
                {showAll && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 border border-border rounded-xl overflow-x-auto max-h-56 overflow-y-auto scroll-thin">
                      <table className="w-full text-xs min-w-[500px]">
                        <thead>
                          <tr className="bg-foreground/[0.02] border-b border-border sticky top-0">
                            <th className="text-left px-3 py-2 font-semibold text-muted">Date</th>
                            <th className="text-left px-3 py-2 font-semibold text-muted">Description</th>
                            <th className="text-left px-3 py-2 font-semibold text-muted">Category</th>
                            <th className="text-right px-3 py-2 font-semibold text-muted">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {merged.transactions.map((tx, i) => (
                            <tr key={i} className="border-b border-border/40 last:border-0">
                              <td className="px-3 py-1.5 text-muted balance-num whitespace-nowrap">{tx.date}</td>
                              <td className="px-3 py-1.5 text-foreground truncate max-w-[180px]">{tx.description}</td>
                              <td className="px-3 py-1.5">
                                <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                                  tx.type === "INCOME" ? "bg-mint/10 text-mint" : "bg-rose/10 text-rose"
                                }`}>
                                  {tx.categoryName}
                                </span>
                              </td>
                              <td className={`px-3 py-1.5 text-right font-semibold balance-num whitespace-nowrap ${
                                tx.type === "INCOME" ? "text-mint" : "text-rose"
                              }`}>
                                {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <div className="p-3 bg-rose/[0.05] border border-rose/20 rounded-xl text-sm text-rose">{error}</div>
            )}
          </motion.div>
        )}

        {/* ---- RESULT ---- */}
        {step === "result" && importResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center py-6 space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-mint/10 border border-mint/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-mint" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {importResult.created} transaction{importResult.created !== 1 ? "s" : ""} imported
              </p>
            </div>
            {importResult.newCategories.length > 0 && (
              <div className="bg-foreground/[0.03] rounded-xl p-4 text-left">
                <p className="text-xs font-semibold text-muted mb-2">New categories created:</p>
                <div className="flex flex-wrap gap-1.5">
                  {importResult.newCategories.map((name) => (
                    <span key={name} className="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-lg">{name}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};
