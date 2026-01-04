"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MortgageResult, PaymentScheduleRow, formatCurrency } from "@/utils/mortgageMath";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, Calendar, Wallet } from "lucide-react";
import { LoanProgressBar } from "@/components/LoanProgressBar";

interface SummaryCardProps {
  result: MortgageResult;
  updatedSchedule?: PaymentScheduleRow[];
  loanAmount?: number;
  paidMonths?: number;
  onPaidMonthsChange?: (months: number) => void;
}

export function SummaryCard({ 
  result, 
  updatedSchedule, 
  loanAmount, 
  paidMonths = 0,
  onPaidMonthsChange,
}: SummaryCardProps) {
  // Use updated schedule if provided, otherwise use original
  const schedule = updatedSchedule || result.schedule;
  
  // Calculate totals from the actual schedule
  const totalInterestPaid = schedule.reduce((sum, row) => sum + row.interestPayment, 0);
  const totalPrincipalPaid = schedule.reduce((sum, row) => sum + row.principalPayment, 0);
  const totalPaymentAmount = totalInterestPaid + totalPrincipalPaid;
  const finalMonth = schedule.length > 0 && schedule[schedule.length - 1].remainingBalance <= 0.01
    ? schedule.length
    : undefined;
  
  // Calculate dynamic remaining balance based on paid months (SIMULATION)
  const totalLoanAmount = loanAmount || (schedule[0]?.remainingBalance || 0);
  const { remainingBalance, remainingMonths } = useMemo(() => {
    if (paidMonths === 0) {
      return {
        remainingBalance: totalLoanAmount,
        remainingMonths: schedule.length,
      };
    }
    if (paidMonths >= schedule.length) {
      return {
        remainingBalance: 0,
        remainingMonths: 0,
      };
    }
    return {
      remainingBalance: schedule[paidMonths - 1]?.remainingBalance || 0,
      remainingMonths: schedule.length - paidMonths,
    };
  }, [schedule, paidMonths, totalLoanAmount]);

  const summaryItems = [
    {
      label: "Monthly Payment",
      value: formatCurrency(result.monthlyPayment),
      icon: DollarSign,
      color: "text-primary",
    },
    {
      label: "Total Interest",
      value: formatCurrency(Math.round(totalInterestPaid * 100) / 100),
      icon: TrendingDown,
      color: "text-emerald-600",
    },
    {
      label: "Total Payment",
      value: formatCurrency(Math.round(totalPaymentAmount * 100) / 100),
      icon: DollarSign,
      color: "text-slate-700",
    },
    {
      label: "Loan Term",
      value: finalMonth
        ? `${finalMonth} months`
        : `${schedule.length} months`,
      icon: Calendar,
      color: "text-indigo-600",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="shadow-xl border-slate-200/50 bg-white/95 backdrop-blur-sm relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 pointer-events-none" />
        
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <CardTitle className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Payment Summary
              </CardTitle>
            </div>
            
            {/* Months Paid Dropdown - Centralized Control */}
            {onPaidMonthsChange && (
              <div className="flex items-center gap-3">
                <Label htmlFor="paidMonthsSummary" className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  Paid Months:
                </Label>
                <select
                  id="paidMonthsSummary"
                  value={paidMonths}
                  onChange={(e) => onPaidMonthsChange(Number(e.target.value))}
                  className="px-3 py-2 border border-slate-200 border-slate-300 rounded-lg text-sm bg-white hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors text-slate-900"
                >
                  {Array.from({ length: schedule.length + 1 }, (_, i) => (
                    <option key={i} value={i}>
                      {i} month{i !== 1 ? "s" : ""} paid
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summaryItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/50 hover:border-primary/30 hover:shadow-lg transition-all group cursor-default"
                >
                  <motion.div 
                    className={`p-3 rounded-xl bg-gradient-to-br ${item.color.includes('primary') ? 'from-primary/10 to-primary/5' : item.color.includes('emerald') ? 'from-emerald-500/10 to-emerald-500/5' : item.color.includes('indigo') ? 'from-indigo-500/10 to-indigo-500/5' : 'from-slate-500/10 to-slate-500/5'} group-hover:scale-110 transition-transform`}
                    whileHover={{ rotate: 5 }}
                  >
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors">
                      {item.value}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Progress Bar */}
          <LoanProgressBar
            totalLoanAmount={totalLoanAmount}
            remainingBalance={remainingBalance}
            remainingMonths={remainingMonths}
          />

          {/* Enhanced Today's Payoff Amount Card */}
          {schedule.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
              whileHover={{ scale: 1.02, y: -3 }}
              className="mt-6 p-6 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-xl border border-slate-200 border-emerald-400 shadow-xl relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-50 mb-1">
                      {paidMonths === 0 ? "Initial Loan Amount" : "Today's Payoff Amount"}
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(remainingBalance)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-emerald-50 mb-1">After Payment #{paidMonths}</p>
                  <p className="text-sm text-white font-medium">
                    {paidMonths === 0 
                      ? "Your freedom price"
                      : `${remainingMonths} months to freedom`
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}



