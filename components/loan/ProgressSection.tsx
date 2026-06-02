"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { MortgageResult } from "@/utils/mortgageMath";
import { formatCurrency, monthsToYears } from "@/lib/format";

interface ProgressSectionProps {
  result: MortgageResult;
  paidMonths: number;
}

export function ProgressSection({ result, paidMonths }: ProgressSectionProps) {
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

  const percentPaid = loanAmount > 0
    ? Math.min(100, ((loanAmount - remainingBalance) / loanAmount) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="card-premium p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-foreground">Payment Progress</p>
        <span className="text-sm font-bold balance-num text-brand">
          {percentPaid.toFixed(1)}%
        </span>
      </div>

      {/* Bar track */}
      <div className="relative h-2.5 rounded-full bg-border overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentPaid}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: "linear-gradient(90deg, #2f6bff 0%, #8b7bff 55%, #2bd4a4 100%)",
          }}
        />
      </div>

      {/* Stats below bar */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-xs text-muted mb-0.5">Remaining Balance</p>
          <p className="text-base font-bold balance-num text-foreground">
            {formatCurrency(remainingBalance)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted mb-0.5">Time Remaining</p>
          <p className="text-base font-bold balance-num text-foreground">
            {monthsToYears(remainingMonths)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
