"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseCSV, mergeParsedResults } from "@/lib/csv/parser";
import { fetchAccounts, type Account } from "@/lib/api/budget/accounts";
import { batchCreateTransactions } from "@/lib/api/budget/transactions-batch";
import type { ParsedCsvResult, ParsedTransaction } from "@/lib/csv/types";

type Step = "upload" | "preview" | "result";

interface CsvFile {
  name: string;
  result: ParsedCsvResult;
}

interface ImportResult {
  created: number;
  skipped: number;
  newCategories: string[];
}

export default function CsvUploadModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("upload");
  const [csvFiles, setCsvFiles] = useState<CsvFile[]>([]);
  const [merged, setMerged] = useState<ParsedCsvResult | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAccounts().then((accs) => {
      setAccounts(accs);
      if (accs.length > 0) setSelectedAccountId(accs[0].id);
    });
  }, []);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const result = parseCSV(text);
          const newFile: CsvFile = { name: file.name, result };
          const updatedFiles = [...csvFiles, newFile];
          setCsvFiles(updatedFiles);

          const mergedResult = mergeParsedResults(updatedFiles.map((f) => f.result));
          setMerged(mergedResult);
          setStep("preview");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to parse CSV file");
        }
      };
      reader.readAsText(file);
    },
    [csvFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.toLowerCase().endsWith(".csv")) {
        processFile(file);
      } else {
        setError("Please upload a CSV file.");
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [processFile]
  );

  const removeFile = (index: number) => {
    const updated = csvFiles.filter((_, i) => i !== index);
    setCsvFiles(updated);
    if (updated.length === 0) {
      setMerged(null);
      setStep("upload");
    } else {
      setMerged(mergeParsedResults(updated.map((f) => f.result)));
    }
  };

  const handleImport = async () => {
    if (!selectedAccountId || !merged) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        accountId: selectedAccountId,
        transactions: merged.transactions.map((tx) => ({
          amount: tx.type === "INCOME" ? tx.amount : -tx.amount,
          date: tx.date,
          categoryName: tx.categoryName,
          categoryType: tx.type,
          note: tx.description,
          method: tx.method,
        })),
      };
      const result = await batchCreateTransactions(payload);
      setImportResult(result);
      setStep("result");
      window.dispatchEvent(new CustomEvent("transaction-changed"));
      window.dispatchEvent(new CustomEvent("category-changed"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (val: number) => {
    const abs = Math.abs(val);
    const formatted = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return val < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {step === "result" ? "Import Complete" : "Import CSV Transactions"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(100,116,139,0.3) transparent" }}>
          <AnimatePresence mode="wait">
            {/* STEP 1: UPLOAD */}
            {step === "upload" && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                    dragOver
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Drop your CSV file here or click to browse</p>
                      <p className="text-xs text-slate-400 mt-1">Supports Chase Bank & Credit Card statements</p>
                    </div>
                  </div>
                </div>
                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
                )}
              </motion.div>
            )}

            {/* STEP 2: PREVIEW */}
            {step === "preview" && merged && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Uploaded files */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Files</span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add another CSV
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {csvFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          f.result.format === "BANK" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                        }`}>
                          {f.result.format === "BANK" ? "BANK" : "CC"}
                        </div>
                        <span className="text-sm text-slate-700 truncate max-w-[200px]">{f.name}</span>
                        <span className="text-xs text-slate-400">{f.result.transactions.length} items</span>
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4l8 8M12 4l-8 8" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-500">Transactions</div>
                    <div className="text-lg font-bold text-slate-900">{merged.transactions.length}</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-emerald-600">Income</div>
                    <div className="text-lg font-bold text-emerald-700">{formatCurrency(merged.totalIncome)}</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-red-600">Expenses</div>
                    <div className="text-lg font-bold text-red-700">{formatCurrency(merged.totalExpense)}</div>
                  </div>
                </div>

                {/* Account selector */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Save to Account</label>
                  <select
                    value={selectedAccountId ?? ""}
                    onChange={(e) => setSelectedAccountId(e.target.value || null)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Category groups table */}
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">By Category</div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-3 py-2 text-xs font-medium text-slate-500">Category</th>
                          <th className="text-center px-3 py-2 text-xs font-medium text-slate-500">Count</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-slate-500">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {merged.categoryGroups.map((g) => (
                          <tr key={g.name} className="border-b border-slate-100 last:border-0">
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${g.type === "INCOME" ? "bg-emerald-500" : "bg-red-400"}`} />
                                <span className="text-slate-700">{g.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center text-slate-500">{g.count}</td>
                            <td className={`px-3 py-2 text-right font-medium ${g.total >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                              {formatCurrency(g.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Expandable all transactions */}
                <div>
                  <button
                    onClick={() => setShowAllTransactions(!showAllTransactions)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <svg
                      width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
                      className={`transition-transform ${showAllTransactions ? "rotate-90" : ""}`}
                    >
                      <path d="M4 2l4 4-4 4" />
                    </svg>
                    {showAllTransactions ? "Hide" : "View"} all transactions
                  </button>
                  {showAllTransactions && (
                    <div
                      className="mt-2 border border-slate-200 rounded-lg overflow-x-auto max-h-64 overflow-y-auto"
                      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(100,116,139,0.3) transparent" }}
                    >
                      <table className="w-full text-xs min-w-[500px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 sticky top-0">
                            <th className="text-left px-3 py-2 font-medium text-slate-500">Date</th>
                            <th className="text-left px-3 py-2 font-medium text-slate-500">Description</th>
                            <th className="text-left px-3 py-2 font-medium text-slate-500">Category</th>
                            <th className="text-right px-3 py-2 font-medium text-slate-500">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {merged.transactions.map((tx, i) => (
                            <tr key={i} className="border-b border-slate-50 last:border-0">
                              <td className="px-3 py-1.5 text-slate-500 whitespace-nowrap">{tx.date}</td>
                              <td className="px-3 py-1.5 text-slate-700 truncate max-w-[200px]">{tx.description}</td>
                              <td className="px-3 py-1.5">
                                <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded ${
                                  tx.type === "INCOME" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                                }`}>
                                  {tx.categoryName}
                                </span>
                              </td>
                              <td className={`px-3 py-1.5 text-right font-medium whitespace-nowrap ${
                                tx.type === "INCOME" ? "text-emerald-600" : "text-red-600"
                              }`}>
                                {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
                )}
              </motion.div>
            )}

            {/* STEP 3: RESULT */}
            {step === "result" && importResult && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-900">
                    {importResult.created} transactions imported
                  </p>
                  {importResult.skipped > 0 && (
                    <p className="text-sm text-slate-500 mt-1">{importResult.skipped} duplicates skipped</p>
                  )}
                </div>
                {importResult.newCategories.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-3 text-left">
                    <p className="text-xs font-medium text-slate-500 mb-2">New categories created:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {importResult.newCategories.map((name) => (
                        <span key={name} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-3">
          {step === "preview" && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={saving || !selectedAccountId}
                className="px-5 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {saving ? "Importing..." : `Import ${merged?.transactions.length ?? 0} transactions`}
              </button>
            </>
          )}
          {step === "result" && (
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
