"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useBudgetStore } from "@/stores/useBudgetStore";
import { computeProjection } from "@/lib/local/budget-calc";
import { formatCurrency, monthName } from "@/lib/format";
import { Skeleton } from "./ui";

interface Props {
  selectedYear: number;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg p-3 min-w-[160px]">
      <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
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
};

export const CashFlowChart: React.FC<Props> = ({ selectedYear }) => {
  const hydrated = useBudgetStore((s) => s.hydrated);
  const accounts = useBudgetStore((s) => s.accounts);
  const categories = useBudgetStore((s) => s.categories);
  const transactions = useBudgetStore((s) => s.transactions);
  const recurring = useBudgetStore((s) => s.recurring);
  const savingsGoals = useBudgetStore((s) => s.savingsGoals);

  const chartData = useMemo(() => {
    if (!hydrated) return null;
    const proj = computeProjection({ accounts, categories, transactions, recurring, savingsGoals }, selectedYear);
    return proj.months.map((m) => ({
      month: monthName(m.month).slice(0, 3),
      Income: m.recurringIncome + m.oneOffIncome,
      Expenses: m.recurringExpense + m.oneOffExpense + m.savingsExpense,
      Net: m.monthNet,
    }));
  }, [hydrated, accounts, categories, transactions, recurring, savingsGoals, selectedYear]);

  if (!hydrated || !chartData) {
    return <Skeleton className="h-72 w-full" />;
  }

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2bd4a4" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#2bd4a4" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6b8b" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#ff6b8b" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 0" stroke="rgba(11,18,32,0.06)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `$${Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(47,107,255,0.04)" }} />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="Income" fill="url(#incomeGrad)" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="Expenses" fill="url(#expenseGrad)" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Line
            type="monotone"
            dataKey="Net"
            stroke="#2f6bff"
            strokeWidth={2}
            dot={{ fill: "#2f6bff", strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: "#2f6bff" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
