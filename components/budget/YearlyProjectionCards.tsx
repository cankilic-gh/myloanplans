"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface MonthProjection {
  month: number;
  year: number;
  recurringIncome: number;
  recurringExpense: number;
  oneOffIncome: number;
  oneOffExpense: number;
  monthNet: number;
  runningBalance: number;
}

interface ProjectionData {
  year: number;
  monthlyRecurringIncome: number;
  monthlyRecurringExpense: number;
  monthlyNet: number;
  yearlyIncome: number;
  yearlyExpense: number;
  yearEndBalance: number;
  months: MonthProjection[];
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

type ViewMode = "yearly" | "monthly";

export default function YearlyProjectionCards() {
  const [data, setData] = useState<ProjectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-based

  const loadProjection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentYear = new Date().getFullYear();
      const res = await fetch(`/api/budget/projection?year=${currentYear}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch projection: ${res.status}`);
      }
      const json: ProjectionData = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error loading projection:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjection();

    const handleChange = () => loadProjection();
    window.addEventListener("recurring-changed", handleChange);
    window.addEventListener("transaction-changed", handleChange);

    return () => {
      window.removeEventListener("recurring-changed", handleChange);
      window.removeEventListener("transaction-changed", handleChange);
    };
  }, [loadProjection]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-9 bg-slate-100 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-slate-200 p-4 shadow-lg animate-pulse"
            >
              <div className="h-3 bg-slate-200 rounded w-20 mb-3" />
              <div className="h-7 bg-slate-200 rounded w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-lg">
        <div className="text-sm text-red-600">
          Unable to load projection data. Please try again later.
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Get selected month data
  const monthData = data.months?.find(
    (m) => m.month === selectedMonth + 1
  );

  const monthIncome = monthData
    ? monthData.recurringIncome + monthData.oneOffIncome
    : data.monthlyRecurringIncome;
  const monthExpense = monthData
    ? monthData.recurringExpense + monthData.oneOffExpense
    : data.monthlyRecurringExpense;
  const monthNet = monthData ? monthData.monthNet : data.monthlyNet;
  const monthBalance = monthData ? monthData.runningBalance : data.monthlyNet;

  const yearlyCards = [
    { label: "Monthly Net", value: data.monthlyNet, colorBySign: true },
    { label: "Yearly Income", value: data.yearlyIncome, color: "text-emerald-600" },
    { label: "Yearly Expenses", value: data.yearlyExpense, color: "text-red-600" },
    { label: "Year-End Balance", value: data.yearEndBalance, colorBySign: true },
  ];

  const monthlyCards = [
    { label: "Net", value: monthNet, colorBySign: true },
    { label: "Income", value: monthIncome, color: "text-emerald-600" },
    { label: "Expenses", value: monthExpense, color: "text-red-600" },
    { label: "Running Balance", value: monthBalance, colorBySign: true },
  ];

  const cards = viewMode === "yearly" ? yearlyCards : monthlyCards;

  return (
    <div className="space-y-3">
      {/* View toggle + month selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("yearly")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === "yearly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Yearly
          </button>
          <button
            onClick={() => setViewMode("monthly")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Monthly
          </button>
        </div>

        {viewMode === "monthly" && (
          <div className="flex items-center gap-1.5">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              {MONTH_NAMES.map((name, i) => {
                const m = data.months?.find((mo) => mo.month === i + 1);
                const net = m ? m.monthNet : data.monthlyNet;
                const sign = net >= 0 ? "+" : "";
                return (
                  <option key={i} value={i}>
                    {name} ({sign}${Math.abs(net).toLocaleString("en-US", { maximumFractionDigits: 0 })})
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {viewMode === "yearly" && (
          <span className="text-xs text-slate-400">{data.year}</span>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const colorClass = card.colorBySign
            ? card.value >= 0
              ? "text-emerald-600"
              : "text-red-600"
            : card.color;

          return (
            <motion.div
              key={`${viewMode}-${card.label}`}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="bg-white rounded-lg border border-slate-200 p-4 shadow-lg"
            >
              <div className="text-xs text-slate-500 mb-1">
                {viewMode === "monthly" && card.label === "Running Balance"
                  ? `Balance thru ${MONTH_NAMES[selectedMonth]}`
                  : card.label}
              </div>
              <div className={`text-2xl font-bold ${colorClass}`}>
                {formatCurrency(card.value)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
