"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

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

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function YearlyProjectionCards() {
  const [data, setData] = useState<ProjectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentYear = new Date().getFullYear();
      const res = await fetch(`/api/budget/projection?year=${currentYear}`);
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

  const cards = [
    {
      label: "Monthly Net",
      value: data.monthlyNet,
      colorBySign: true,
    },
    {
      label: "Yearly Income",
      value: data.yearlyIncome,
      color: "text-emerald-600",
    },
    {
      label: "Yearly Expenses",
      value: data.yearlyExpense,
      color: "text-red-600",
    },
    {
      label: "Year-End Balance",
      value: data.yearEndBalance,
      colorBySign: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const colorClass = card.colorBySign
          ? card.value >= 0
            ? "text-emerald-600"
            : "text-red-600"
          : card.color;

        return (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="bg-white rounded-lg border border-slate-200 p-4 shadow-lg"
          >
            <div className="text-xs text-slate-500 mb-1">{card.label}</div>
            <div className={`text-2xl font-bold ${colorClass}`}>
              {formatCurrency(card.value)}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
