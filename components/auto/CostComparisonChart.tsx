"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
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
  horizonYears: number;
}

export function CostComparisonChart({ series, horizonYears }: Props) {
  const chartData = useMemo(
    () =>
      series.map((r) => ({
        year: r.year,
        Finance: r.finance.netCost,
        Lease: r.lease.netCost,
      })),
    [series]
  );

  const summary = useMemo(() => {
    const first = series[0];
    const last = series[series.length - 1];
    if (!first || !last) return "";
    const leadAtStart = first.finance.netCost <= first.lease.netCost ? "financing" : "leasing";
    const leadAtEnd = last.finance.netCost <= last.lease.netCost ? "financing" : "leasing";
    return leadAtStart === leadAtEnd
      ? `${leadAtStart[0].toUpperCase()}${leadAtStart.slice(1)} stays the cheaper net cost across all ${series.length} years shown.`
      : `${leadAtStart[0].toUpperCase()}${leadAtStart.slice(1)} starts cheaper, but ${leadAtEnd} becomes cheaper by year ${last.year}.`;
  }, [series]);

  return (
    <div className="card-premium p-5 sm:p-6 space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Net Cost Comparison — Years 1–10</p>
        <p className="text-xs text-muted mt-0.5">{summary}</p>
      </div>

      <div
        role="img"
        aria-label={`Line chart comparing cumulative net cost of financing vs. leasing from year 1 to year 10. ${summary}`}
        style={{ width: "100%", height: 280 }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={280}
          minHeight={280}
          initialDimension={{ width: 600, height: 280 }}
        >
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 0" stroke="rgba(11,18,32,0.06)" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              axisLine={false}
              tickLine={false}
              label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11, fill: "var(--muted)" }}
            />
            <YAxis
              tickFormatter={(v) => formatCompact(v)}
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(47,107,255,0.25)" }} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} iconType="circle" iconSize={8} />
            <ReferenceLine x={horizonYears} stroke="rgba(11,18,32,0.18)" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="Finance"
              stroke="#2f6bff"
              strokeWidth={2.5}
              dot={{ fill: "#2f6bff", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="Lease"
              stroke="#8b7bff"
              strokeWidth={2.5}
              dot={{ fill: "#8b7bff", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer text-muted hover:text-foreground transition-colors font-medium">
          View chart data as a table
        </summary>
        <div className="mt-3 overflow-x-auto scroll-thin">
          <table className="w-full text-xs">
            <caption className="sr-only">
              Net cost by year for financing vs. leasing, years 1 through 10
            </caption>
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th scope="col" className="py-1.5 pr-4 font-medium">Year</th>
                <th scope="col" className="py-1.5 pr-4 font-medium">Finance Net Cost</th>
                <th scope="col" className="py-1.5 font-medium">Lease Net Cost</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => (
                <tr key={row.year} className="border-b border-border/60 last:border-0">
                  <td className="py-1.5 pr-4 balance-num text-foreground">{row.year}</td>
                  <td className="py-1.5 pr-4 balance-num text-foreground">{formatCurrency(row.Finance)}</td>
                  <td className="py-1.5 balance-num text-foreground">{formatCurrency(row.Lease)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
