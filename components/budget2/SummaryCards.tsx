"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useBudgetStore } from "@/stores/useBudgetStore";
import { computeSummary } from "@/lib/local/budget-calc";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "./ui";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export const SummaryCards: React.FC = () => {
  const hydrated = useBudgetStore((s) => s.hydrated);
  const transactions = useBudgetStore((s) => s.transactions);
  const categories = useBudgetStore((s) => s.categories);
  const accounts = useBudgetStore((s) => s.accounts);
  const recurring = useBudgetStore((s) => s.recurring);
  const savingsGoals = useBudgetStore((s) => s.savingsGoals);

  const summary = useMemo(() => {
    if (!hydrated) return null;
    return computeSummary({ accounts, categories, transactions, recurring, savingsGoals });
  }, [hydrated, accounts, categories, transactions, recurring, savingsGoals]);

  if (!hydrated || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  const cards = [
    {
      label: "This Month Net",
      value: summary.totalCurrent,
      icon: <Wallet className="w-5 h-5" />,
      colorBySign: true,
      accentClass: summary.totalCurrent >= 0 ? "text-mint" : "text-rose",
      bgClass: summary.totalCurrent >= 0 ? "bg-mint/10" : "bg-rose/10",
      borderClass: summary.totalCurrent >= 0 ? "border-mint/20" : "border-rose/20",
    },
    {
      label: "Total Income",
      value: summary.totalIncome,
      icon: <TrendingUp className="w-5 h-5" />,
      accentClass: "text-mint",
      bgClass: "bg-mint/10",
      borderClass: "border-mint/20",
    },
    {
      label: "Total Expense",
      value: summary.totalExpense,
      icon: <TrendingDown className="w-5 h-5" />,
      accentClass: "text-rose",
      bgClass: "bg-rose/10",
      borderClass: "border-rose/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="card-premium p-5 group"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-muted">{card.label}</span>
            <div className={`w-8 h-8 rounded-lg ${card.bgClass} border ${card.borderClass} flex items-center justify-center ${card.accentClass}`}>
              {card.icon}
            </div>
          </div>
          <div className={`text-2xl font-bold balance-num tracking-tight ${card.accentClass}`}>
            {formatCurrency(card.value)}
          </div>
          <div className="mt-1 text-xs text-muted">Current month</div>
        </motion.div>
      ))}
    </div>
  );
};
