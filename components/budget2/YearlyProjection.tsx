"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useBudgetStore } from "@/stores/useBudgetStore";
import { computeProjection } from "@/lib/local/budget-calc";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "./ui";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const THIS_YEAR = new Date().getFullYear();

interface Props {
  selectedYear: number;
  onYearChange: (y: number) => void;
}

export const YearlyProjection: React.FC<Props> = ({ selectedYear, onYearChange }) => {
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

  if (!hydrated || !projection) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: "Annual Income",
      value: projection.yearlyIncome,
      accentClass: "text-mint",
      bgClass: "bg-mint/10",
      borderClass: "border-mint/20",
      prefix: "+",
    },
    {
      label: "Annual Expense",
      value: projection.yearlyExpense,
      accentClass: "text-rose",
      bgClass: "bg-rose/10",
      borderClass: "border-rose/20",
      prefix: "-",
    },
    {
      label: "Year-End Balance",
      value: projection.yearEndBalance,
      accentClass: projection.yearEndBalance >= 0 ? "text-mint" : "text-rose",
      bgClass: projection.yearEndBalance >= 0 ? "bg-mint/10" : "bg-rose/10",
      borderClass: projection.yearEndBalance >= 0 ? "border-mint/20" : "border-rose/20",
    },
    {
      label: "Monthly Net",
      value: projection.monthlyNet,
      accentClass: projection.monthlyNet >= 0 ? "text-brand" : "text-rose",
      bgClass: projection.monthlyNet >= 0 ? "bg-brand/10" : "bg-rose/10",
      borderClass: projection.monthlyNet >= 0 ? "border-brand/20" : "border-rose/20",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Year selector */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-foreground/[0.04] rounded-xl p-1">
          <button
            type="button"
            onClick={() => onYearChange(selectedYear - 1)}
            disabled={selectedYear <= THIS_YEAR - 5}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-foreground/[0.06] transition-colors text-muted disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            <CalendarDays className="w-4 h-4 text-brand" />
            <span className="text-sm font-semibold text-foreground balance-num w-10 text-center">
              {selectedYear}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onYearChange(selectedYear + 1)}
            disabled={selectedYear >= THIS_YEAR + 5}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-foreground/[0.06] transition-colors text-muted disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-muted">Cash-flow projection</span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="card-premium p-4"
          >
            <div className={`inline-flex items-center justify-center w-7 h-7 rounded-lg mb-3 ${card.bgClass} border ${card.borderClass}`}>
              <span className={`text-xs font-bold ${card.accentClass}`}>$</span>
            </div>
            <div className={`text-xl font-bold balance-num tracking-tight ${card.accentClass}`}>
              {formatCurrency(card.value)}
            </div>
            <div className="mt-0.5 text-xs text-muted">{card.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
