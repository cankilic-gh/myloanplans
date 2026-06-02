"use client";

import { useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import {
  DollarSign,
  TrendingDown,
  Wallet,
  Calendar,
  ChevronsRight,
} from "lucide-react";
import type { MortgageResult } from "@/utils/mortgageMath";
import { useLoanStore } from "@/stores/useLoanStore";
import { formatCurrency, formatCompact, monthsToYears } from "@/lib/format";

interface SummaryCardsProps {
  result: MortgageResult;
  activeId: string;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: i * 0.07,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

interface StatCardProps {
  index: number;
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: string; // Tailwind text color class
  bg: string;    // Tailwind bg class
}

function StatCard({ index, icon, label, value, sub, accent, bg }: StatCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="card-premium p-5 flex items-start gap-4 group cursor-default"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
        <span className={accent}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted mb-1">{label}</p>
        <p className={`text-xl font-bold balance-num tracking-tight ${accent}`}>{value}</p>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

export function SummaryCards({ result, activeId }: SummaryCardsProps) {
  const { runtime, setPaidMonths } = useLoanStore();
  const rt = runtime[activeId];
  const paidMonths = rt?.paidMonths ?? 0;
  const schedule = result.schedule;
  const totalMonths = schedule.length;

  const loanAmount = useMemo(() => {
    if (schedule.length === 0) return 0;
    return schedule[0].remainingBalance + schedule[0].principalPayment;
  }, [schedule]);

  const { remainingBalance, remainingMonths } = useMemo(() => {
    if (paidMonths === 0) return { remainingBalance: loanAmount, remainingMonths: totalMonths };
    if (paidMonths >= totalMonths) return { remainingBalance: 0, remainingMonths: 0 };
    return {
      remainingBalance: schedule[paidMonths - 1]?.remainingBalance ?? 0,
      remainingMonths: totalMonths - paidMonths,
    };
  }, [schedule, paidMonths, loanAmount, totalMonths]);

  const finalMonthCount = result.finalMonth ?? totalMonths;

  const stats: Omit<StatCardProps, "index">[] = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: "Monthly Payment",
      value: formatCurrency(result.monthlyPayment),
      accent: "text-brand",
      bg: "bg-brand/10",
    },
    {
      icon: <TrendingDown className="w-5 h-5" />,
      label: "Total Interest",
      value: formatCompact(result.totalInterest),
      sub: formatCurrency(result.totalInterest),
      accent: "text-rose",
      bg: "bg-rose/10",
    },
    {
      icon: <Wallet className="w-5 h-5" />,
      label: "Total Payment",
      value: formatCompact(result.totalPayment),
      sub: formatCurrency(result.totalPayment),
      accent: "text-lavender",
      bg: "bg-lavender/10",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: "Loan Term",
      value: monthsToYears(finalMonthCount),
      sub: `${finalMonthCount} months`,
      accent: "text-mint",
      bg: "bg-mint/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} index={i} {...s} />
        ))}
      </div>

      {/* Payoff simulator */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="card-premium p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <ChevronsRight className="w-4 h-4 text-brand" />
          <p className="text-sm font-semibold text-foreground">Payoff Simulator</p>
          <span className="text-xs text-muted ml-auto">
            Month {paidMonths} of {totalMonths}
          </span>
        </div>

        {/* Slider */}
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={totalMonths}
            value={paidMonths}
            onChange={(e) => setPaidMonths(activeId, Number(e.target.value))}
            className="w-full h-2 accent-brand cursor-pointer"
            aria-label="Paid months"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="paidMonthsInput" className="text-xs text-muted whitespace-nowrap">
                Paid months:
              </label>
              <input
                id="paidMonthsInput"
                type="number"
                min={0}
                max={totalMonths}
                value={paidMonths}
                onChange={(e) => {
                  const v = Math.min(totalMonths, Math.max(0, Number(e.target.value)));
                  setPaidMonths(activeId, v);
                }}
                className="w-16 h-8 rounded-lg border border-border bg-card text-sm text-center balance-num focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
              />
            </div>
            <span className="text-xs text-muted">{monthsToYears(remainingMonths)} remaining</span>
          </div>
        </div>

        {/* Three stat tiles */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="rounded-xl bg-background border border-border p-3 text-center">
            <p className="text-xs text-muted mb-1.5">Remaining Balance</p>
            <p className="text-sm font-bold balance-num text-foreground">
              {formatCompact(remainingBalance)}
            </p>
          </div>
          <div className="rounded-xl bg-background border border-border p-3 text-center">
            <p className="text-xs text-muted mb-1.5">Months Left</p>
            <p className="text-sm font-bold balance-num text-foreground">
              {remainingMonths}
            </p>
          </div>
          <div className="rounded-xl bg-brand/[0.06] border border-brand/20 p-3 text-center">
            <p className="text-xs text-brand/80 mb-1.5">Today's Payoff</p>
            <p className="text-sm font-bold balance-num text-brand">
              {formatCompact(remainingBalance)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
