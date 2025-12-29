"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/utils/mortgageMath";

interface LoanProgressBarProps {
  totalLoanAmount: number;
  remainingBalance: number;
  remainingMonths: number;
}

export function LoanProgressBar({
  totalLoanAmount,
  remainingBalance,
  remainingMonths,
}: LoanProgressBarProps) {
  // Calculate percentage paid (inverse of remaining)
  const percentagePaid =
    totalLoanAmount > 0
      ? ((totalLoanAmount - remainingBalance) / totalLoanAmount) * 100
      : 0;

  return (
    <div className="mt-6 p-4 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg border border-slate-200 border-emerald-200">
      {/* Progress Label */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-700">Payment Progress</p>
        <span className="text-sm font-bold text-emerald-600">
          {percentagePaid.toFixed(1)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentagePaid}%` }}
          transition={{
            duration: 1,
            ease: "easeOut",
            delay: 0.3,
          }}
          className="h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-full shadow-lg"
          style={{
            boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)",
          }}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-1">Remaining Balance</p>
          <p className="text-base font-bold text-slate-900">
            {formatCurrency(remainingBalance)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-1">Months Left</p>
          <p className="text-base font-bold text-slate-900">
            {remainingMonths} {remainingMonths === 1 ? "month" : "months"}
          </p>
        </div>
      </div>
    </div>
  );
}



