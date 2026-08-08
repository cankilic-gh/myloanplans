"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ComparisonResult } from "@/lib/auto/autoMath";
import { formatCurrency, formatCompact } from "@/lib/format";

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg p-3 min-w-[170px]">
      <p className="text-xs font-semibold text-foreground mb-2">Year {label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-xs text-muted">{entry.name}</span>
          </div>
          <span className="text-xs font-semibold text-foreground balance-num">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  series: ComparisonResult[];
}

export function DepreciationBalanceChart({ series }: Props) {
  const chartData = useMemo(
    () =>
      series.map((r) => ({
        year: r.year,
        "Resale Value": r.finance.resaleValue,
        "Loan Balance": r.finance.remainingBalance,
        Equity: r.finance.equity,
      })),
    [series]
  );

  return (
    <div className="card-premium p-5 sm:p-6 space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Vehicle Value vs. Loan Balance (Finance)</p>
        <p className="text-xs text-muted mt-0.5">
          Estimated resale value from the depreciation curve against the financed loan&apos;s remaining
          balance — the gap between the two lines is your equity.
        </p>
      </div>

      <div
        role="img"
        aria-label="Area chart comparing estimated resale value against remaining loan balance for the financed vehicle, years 1 through 10."
        style={{ width: "100%", height: 260 }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={280}
          minHeight={260}
          initialDimension={{ width: 600, height: 260 }}
        >
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="resaleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2bd4a4" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#2bd4a4" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6b8b" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#ff6b8b" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 0" stroke="rgba(11,18,32,0.06)" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => formatCompact(v)}
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(47,107,255,0.25)" }} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} iconType="circle" iconSize={8} />
            <Area
              type="monotone"
              dataKey="Resale Value"
              stroke="#2bd4a4"
              strokeWidth={2}
              fill="url(#resaleGrad)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="Loan Balance"
              stroke="#ff6b8b"
              strokeWidth={2}
              fill="url(#balanceGrad)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer text-muted hover:text-foreground transition-colors font-medium">
          View chart data as a table
        </summary>
        <div className="mt-3 overflow-x-auto scroll-thin">
          <table className="w-full text-xs">
            <caption className="sr-only">
              Resale value, loan balance, and equity by year for the financed vehicle
            </caption>
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th scope="col" className="py-1.5 pr-4 font-medium">Year</th>
                <th scope="col" className="py-1.5 pr-4 font-medium">Resale Value</th>
                <th scope="col" className="py-1.5 pr-4 font-medium">Loan Balance</th>
                <th scope="col" className="py-1.5 font-medium">Equity</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => (
                <tr key={row.year} className="border-b border-border/60 last:border-0">
                  <td className="py-1.5 pr-4 balance-num text-foreground">{row.year}</td>
                  <td className="py-1.5 pr-4 balance-num text-foreground">{formatCurrency(row["Resale Value"])}</td>
                  <td className="py-1.5 pr-4 balance-num text-foreground">{formatCurrency(row["Loan Balance"])}</td>
                  <td className="py-1.5 balance-num text-foreground">{formatCurrency(row.Equity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
