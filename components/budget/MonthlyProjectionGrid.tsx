"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MonthProjection {
  month: number;
  year: number;
  label: string;
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

function getUserEmail(): string {
  return (typeof window !== "undefined" ? sessionStorage.getItem("userEmail") : null) || "";
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function MonthCard({
  mp,
  isCurrent,
  isPast,
  index,
}: {
  mp: MonthProjection;
  isCurrent: boolean;
  isPast: boolean;
  index: number;
}) {
  const [expanded, setExpanded] = useState(isCurrent);

  const totalIncome = mp.recurringIncome + mp.oneOffIncome;
  const totalExpense = mp.recurringExpense + mp.oneOffExpense;
  const oneOffNet = mp.oneOffIncome - mp.oneOffExpense;
  const hasOneOffs = mp.oneOffIncome !== 0 || mp.oneOffExpense !== 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden transition-opacity ${
        isPast ? "opacity-60" : ""
      } ${isCurrent ? "border-l-4 border-l-blue-500" : ""}`}
    >
      {/* Header -- always visible */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 text-left lg:cursor-default"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">
            {monthNames[mp.month - 1]} {mp.year}
          </span>
          {isCurrent && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">
              Current
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-bold ${
              mp.monthNet >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {formatCurrency(mp.monthNet)}
          </span>
          {/* Chevron - visible on mobile only */}
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform lg:hidden ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Body -- always visible on desktop, expandable on mobile */}
      <div className={`lg:block ${expanded ? "block" : "hidden"}`}>
        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="px-4 pb-4 space-y-1.5"
          >
            <div className="border-t border-slate-100 pt-3" />

            {/* Income */}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Income</span>
              <span className="text-emerald-600 font-medium">
                +{formatCurrency(totalIncome)}
              </span>
            </div>

            {/* Expenses */}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Expenses</span>
              <span className="text-red-600 font-medium">
                -{formatCurrency(totalExpense)}
              </span>
            </div>

            {/* One-offs (only if present) */}
            {hasOneOffs && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">One-offs</span>
                <span
                  className={`font-medium ${
                    oneOffNet >= 0 ? "text-orange-500" : "text-orange-600"
                  }`}
                >
                  {oneOffNet >= 0 ? "+" : ""}
                  {formatCurrency(oneOffNet)}
                </span>
              </div>
            )}

            {/* Net */}
            <div className="flex justify-between text-sm pt-1 border-t border-slate-100">
              <span className="text-slate-700 font-medium">Net</span>
              <span
                className={`font-bold ${
                  mp.monthNet >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {formatCurrency(mp.monthNet)}
              </span>
            </div>

            {/* Running balance badge */}
            <div className="flex justify-between text-xs pt-1">
              <span className="text-slate-400">Running</span>
              <span className="text-slate-500 font-medium">
                {formatCurrency(mp.runningBalance)}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function MonthlyProjectionGrid() {
  const [data, setData] = useState<ProjectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentYear = new Date().getFullYear();
      const res = await fetch(`/api/budget/projection?year=${currentYear}`, {
        headers: {
          "Content-Type": "application/json",
          "x-user-email": getUserEmail(),
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch projection: ${res.status}`);
      }
      const json: ProjectionData = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error loading monthly projection:", err);
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
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-lg">
        <div className="text-sm font-semibold text-slate-700 mb-4">Monthly Projection</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-50 rounded-lg p-4 animate-pulse"
            >
              <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
              <div className="h-3 bg-slate-200 rounded w-20 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-lg">
        <div className="text-sm font-semibold text-slate-700 mb-2">Monthly Projection</div>
        <div className="text-sm text-red-600">
          Unable to load monthly projections. Please try again later.
        </div>
      </div>
    );
  }

  if (!data || !data.months || data.months.length === 0) return null;

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-indexed
  const currentYear = now.getFullYear();

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-lg">
      <div className="text-sm font-semibold text-slate-700 mb-4">
        Monthly Projection {data.year}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {data.months.map((mp, index) => {
          const isCurrent = mp.month === currentMonth && mp.year === currentYear;
          const isPast =
            mp.year < currentYear ||
            (mp.year === currentYear && mp.month < currentMonth);

          return (
            <MonthCard
              key={`${mp.year}-${mp.month}`}
              mp={mp}
              isCurrent={isCurrent}
              isPast={isPast}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}
