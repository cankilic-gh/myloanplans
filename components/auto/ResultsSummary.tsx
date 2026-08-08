"use client";

import { motion } from "framer-motion";
import { Landmark, KeySquare } from "lucide-react";
import type { ComparisonResult } from "@/lib/auto/autoMath";
import { formatCurrency, formatCompact } from "@/lib/format";

interface StatTileProps {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

function StatTile({ label, value, sub, accent = "text-foreground" }: StatTileProps) {
  return (
    <div className="rounded-xl bg-background border border-border p-3">
      <p className="text-[11px] text-muted mb-1">{label}</p>
      <p className={`text-sm font-bold balance-num ${accent}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

interface Props {
  result: ComparisonResult;
}

export function ResultsSummary({ result }: Props) {
  const { finance, lease } = result;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Finance */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="card-premium p-5 space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
            <Landmark className="w-4 h-4 text-brand" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Finance</p>
            <p className="text-xs text-muted">
              Net cost {formatCurrency(finance.netCost)} · {formatCurrency(finance.effectiveMonthlyCost)}/mo effective
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Total Net Cost" value={formatCompact(finance.netCost)} sub={formatCurrency(finance.netCost)} accent="text-brand" />
          <StatTile label="Effective Monthly" value={formatCurrency(finance.effectiveMonthlyCost)} />
          <StatTile label="Cash Paid to Date" value={formatCompact(finance.cashPaidThroughHorizon)} sub={formatCurrency(finance.cashPaidThroughHorizon)} />
          <StatTile label="Interest Paid" value={formatCompact(finance.totalInterestPaid)} sub={formatCurrency(finance.totalInterestPaid)} />
          <StatTile
            label="Remaining Balance"
            value={formatCompact(finance.remainingBalance)}
            sub={finance.loanPaidOff ? "Paid off" : formatCurrency(finance.remainingBalance)}
          />
          <StatTile label="Resale Value" value={formatCompact(finance.resaleValue)} sub={formatCurrency(finance.resaleValue)} />
          <StatTile
            label="Equity"
            value={formatCompact(finance.equity)}
            sub={formatCurrency(finance.equity)}
            accent={finance.equity >= 0 ? "text-mint" : "text-rose"}
          />
          <StatTile label="Monthly Payment" value={formatCurrency(finance.monthlyPayment)} />
        </div>
      </motion.div>

      {/* Lease */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="card-premium p-5 space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-lavender/10 flex items-center justify-center">
            <KeySquare className="w-4 h-4 text-lavender" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Lease</p>
            <p className="text-xs text-muted">
              Net cost {formatCurrency(lease.netCost)} · {formatCurrency(lease.effectiveMonthlyCost)}/mo effective
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Total Net Cost" value={formatCompact(lease.netCost)} sub={formatCurrency(lease.netCost)} accent="text-lavender" />
          <StatTile label="Effective Monthly" value={formatCurrency(lease.effectiveMonthlyCost)} />
          <StatTile
            label="Lease Cycles"
            value={`${lease.cyclesStarted}`}
            sub={`${lease.cyclesCompleted} completed${lease.cyclesStarted > lease.cyclesCompleted ? ", 1 in progress" : ""}`}
          />
          <StatTile
            label="Excess Mileage Charges"
            value={formatCompact(lease.cycles.reduce((s, c) => s + c.excessMileageCharge, 0))}
            sub={formatCurrency(lease.cycles.reduce((s, c) => s + c.excessMileageCharge, 0))}
          />
          <StatTile
            label="Due at Signing (all cycles)"
            value={formatCompact(lease.cycles.reduce((s, c) => s + c.dueAtSigning + c.acquisitionFee, 0))}
          />
          <StatTile
            label="Disposition Fees"
            value={formatCompact(lease.cycles.reduce((s, c) => s + c.dispositionFee, 0))}
          />
          <StatTile
            label="Sales Tax on Payments"
            value={formatCompact(lease.cycles.reduce((s, c) => s + c.taxOnPayments, 0))}
          />
          <StatTile label="Equity at End" value="$0" sub="Returned, not owned" />
        </div>
      </motion.div>
    </div>
  );
}
