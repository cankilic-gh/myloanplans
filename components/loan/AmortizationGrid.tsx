"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { TableIcon, Sparkles } from "lucide-react";
import type { MortgageResult } from "@/utils/mortgageMath";
import { useLoanStore } from "@/stores/useLoanStore";
import { ExportMenu } from "@/components/site/ExportMenu";
import { exportCSV, exportXLS } from "@/lib/export";
import { formatCurrency } from "@/lib/format";

interface AmortizationGridProps {
  result: MortgageResult;
  activeId: string;
  planName: string;
}

export function AmortizationGrid({ result, activeId, planName }: AmortizationGridProps) {
  const { runtime, setOneTimePayment } = useLoanStore();
  const rt = runtime[activeId];
  const paidMonths = rt?.paidMonths ?? 0;
  const oneTimePayments = rt?.oneTimePayments ?? {};

  const schedule = result.schedule;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the current "paid" row when paidMonths changes
  useEffect(() => {
    if (paidMonths <= 0 || !scrollRef.current) return;
    const container = scrollRef.current;
    const row = container.querySelector(`[data-month="${paidMonths}"]`) as HTMLElement | null;
    if (!row) return;
    const containerHeight = container.clientHeight;
    const rowHeight = row.offsetHeight;
    container.scrollTo({
      top: row.offsetTop - containerHeight / 2 + rowHeight / 2,
      behavior: "smooth",
    });
  }, [paidMonths]);

  const handleExtraChange = useCallback(
    (month: number, raw: string) => {
      const amount = parseFloat(raw) || 0;
      setOneTimePayment(activeId, month, amount);
    },
    [activeId, setOneTimePayment]
  );

  // ── Export helpers ────────────────────────────────────────────────────────
  const exportHeader = ["Month", "Payment", "Principal", "Interest", "Extra Payment", "Remaining Balance"];

  const buildRows = () =>
    schedule.map((r) => [
      r.month,
      r.paymentAmount,
      r.principalPayment,
      r.interestPayment,
      oneTimePayments[r.month] ?? r.oneTimeExtraPayment ?? 0,
      r.remainingBalance,
    ]);

  const handleCSV = () => {
    const safeName = planName.replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
    exportCSV([exportHeader, ...buildRows()], `amortization-${safeName}.csv`);
  };

  const handleXLS = () => {
    const safeName = planName.replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
    exportXLS(
      [{ name: "Amortization", rows: [exportHeader, ...buildRows()] }],
      `amortization-${safeName}.xls`
    );
  };

  if (schedule.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="card-premium overflow-hidden"
    >
      {/* Table header bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-lavender/10 flex items-center justify-center">
            <TableIcon className="w-4 h-4 text-lavender" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Amortization Schedule</p>
            <p className="text-xs text-muted">{schedule.length} payments</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {Object.keys(oneTimePayments).length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-mint font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              {Object.keys(oneTimePayments).length} extra payment{Object.keys(oneTimePayments).length !== 1 ? "s" : ""}
            </div>
          )}
          <ExportMenu onCSV={handleCSV} onXLS={handleXLS} align="right" />
        </div>
      </div>

      {/* Scrollable table */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-auto scroll-thin"
        style={{ maxHeight: 520 }}
      >
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card border-b border-border">
            <tr>
              {["Month", "Payment", "Principal", "Interest", "Extra Payment", "Balance"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {schedule.map((row) => {
              const isPaid = row.month <= paidMonths;
              const isCurrentMonth = row.month === paidMonths;
              const extraStored = oneTimePayments[row.month] ?? row.oneTimeExtraPayment ?? 0;

              return (
                <tr
                  key={row.month}
                  data-month={row.month}
                  className={`transition-colors duration-150 ${
                    isCurrentMonth
                      ? "bg-mint/[0.08] ring-1 ring-inset ring-mint/30"
                      : isPaid
                      ? "bg-brand/[0.03]"
                      : "hover:bg-foreground/[0.02]"
                  }`}
                >
                  {/* Month */}
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span
                      className={`text-xs font-semibold balance-num ${
                        isCurrentMonth ? "text-mint" : isPaid ? "text-muted" : "text-foreground"
                      }`}
                    >
                      {row.month}
                    </span>
                  </td>

                  {/* Payment */}
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={`balance-num ${isPaid ? "text-muted" : "text-foreground"}`}>
                      {formatCurrency(row.paymentAmount)}
                    </span>
                  </td>

                  {/* Principal */}
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={`balance-num font-medium ${isPaid ? "text-muted" : "text-mint"}`}>
                      {formatCurrency(row.principalPayment)}
                    </span>
                  </td>

                  {/* Interest */}
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={`balance-num ${isPaid ? "text-muted" : "text-rose"}`}>
                      {formatCurrency(row.interestPayment)}
                    </span>
                  </td>

                  {/* Extra payment — editable input */}
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-muted text-xs pointer-events-none">$</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="0"
                        defaultValue={extraStored > 0 ? String(extraStored) : ""}
                        key={`${activeId}-${row.month}-${extraStored}`}
                        onBlur={(e) => handleExtraChange(row.month, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleExtraChange(row.month, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        className="w-24 h-7 pl-6 pr-2 rounded-lg border border-border bg-background text-xs balance-num focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/15 transition-all placeholder:text-muted/40"
                        aria-label={`Extra payment for month ${row.month}`}
                      />
                    </div>
                  </td>

                  {/* Remaining balance */}
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span
                      className={`balance-num font-semibold ${
                        row.remainingBalance < 1
                          ? "text-mint"
                          : isPaid
                          ? "text-muted"
                          : "text-foreground"
                      }`}
                    >
                      {formatCurrency(row.remainingBalance)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer hint */}
      <div className="px-5 py-3 border-t border-border bg-background/50">
        <p className="text-xs text-muted">
          Enter extra payments per row to see how they shorten your loan. Changes are saved automatically.
        </p>
      </div>
    </motion.div>
  );
}
