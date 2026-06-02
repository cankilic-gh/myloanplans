"use client";

import { useMemo } from "react";
import { useBudgetStore } from "@/stores/useBudgetStore";
import { computeProjection } from "@/lib/local/budget-calc";
import { formatCurrency, monthName } from "@/lib/format";
import { ExportMenu } from "@/components/site/ExportMenu";
import { tableToCSV, tableToXLS } from "@/lib/export";
import { Skeleton } from "./ui";

interface Props {
  selectedYear: number;
}

const HEADER = [
  "Month", "Rec. Income", "Rec. Expense", "Savings", "One-Off Inc.", "One-Off Exp.", "Net", "Running Bal.",
];

export const MonthlyProjectionTable: React.FC<Props> = ({ selectedYear }) => {
  const hydrated = useBudgetStore((s) => s.hydrated);
  const accounts = useBudgetStore((s) => s.accounts);
  const categories = useBudgetStore((s) => s.categories);
  const transactions = useBudgetStore((s) => s.transactions);
  const recurring = useBudgetStore((s) => s.recurring);
  const savingsGoals = useBudgetStore((s) => s.savingsGoals);

  const projection = useMemo(() => {
    if (!hydrated) return null;
    return computeProjection({ accounts, categories, transactions, recurring, savingsGoals }, selectedYear);
  }, [hydrated, accounts, categories, transactions, recurring, savingsGoals, selectedYear]);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const body = useMemo(() => {
    if (!projection) return [];
    return projection.months.map((m) => [
      monthName(m.month),
      m.recurringIncome,
      m.recurringExpense,
      m.savingsExpense,
      m.oneOffIncome,
      m.oneOffExpense,
      m.monthNet,
      m.runningBalance,
    ]);
  }, [projection]);

  const handleCSV = () => tableToCSV(HEADER, body, `cash-flow-${selectedYear}.csv`);
  const handleXLS = () => tableToXLS(`Cash Flow ${selectedYear}`, HEADER, body, `cash-flow-${selectedYear}.xls`);

  if (!hydrated || !projection) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-32 ml-auto" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">12-month projection for {selectedYear}</p>
        <ExportMenu onCSV={handleCSV} onXLS={handleXLS} label="Export" align="right" />
      </div>

      <div className="overflow-x-auto scroll-thin rounded-xl border border-border">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-border bg-foreground/[0.02]">
              {HEADER.map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left text-xs font-semibold text-muted whitespace-nowrap first:pl-4 last:pr-4"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projection.months.map((m) => {
              const isCurrent = m.month === currentMonth && m.year === currentYear;
              const isPast =
                m.year < currentYear || (m.year === currentYear && m.month < currentMonth);
              const netPos = m.monthNet >= 0;

              return (
                <tr
                  key={`${m.year}-${m.month}`}
                  className={`border-b border-border/60 last:border-0 transition-colors hover:bg-foreground/[0.02] ${
                    isCurrent ? "bg-brand/[0.04]" : isPast ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-4 py-2.5 text-xs font-semibold whitespace-nowrap">
                    <span>{monthName(m.month)}</span>
                    {isCurrent && (
                      <span className="ml-1.5 text-[10px] font-medium text-brand bg-brand/10 px-1 py-0.5 rounded">
                        now
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-mint balance-num whitespace-nowrap">
                    {formatCurrency(m.recurringIncome)}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-rose balance-num whitespace-nowrap">
                    {formatCurrency(m.recurringExpense)}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-lavender balance-num whitespace-nowrap">
                    {formatCurrency(m.savingsExpense)}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-mint balance-num whitespace-nowrap">
                    {m.oneOffIncome > 0 ? formatCurrency(m.oneOffIncome) : <span className="text-muted">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-rose balance-num whitespace-nowrap">
                    {m.oneOffExpense > 0 ? formatCurrency(m.oneOffExpense) : <span className="text-muted">—</span>}
                  </td>
                  <td className={`px-3 py-2.5 text-xs font-semibold balance-num whitespace-nowrap ${netPos ? "text-mint" : "text-rose"}`}>
                    {netPos ? "+" : ""}{formatCurrency(m.monthNet)}
                  </td>
                  <td className={`px-4 py-2.5 text-xs font-semibold balance-num whitespace-nowrap ${m.runningBalance >= 0 ? "text-foreground" : "text-rose"}`}>
                    {formatCurrency(m.runningBalance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
