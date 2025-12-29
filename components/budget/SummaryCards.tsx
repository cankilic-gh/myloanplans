"use client";

import { useEffect, useState } from "react";
import { fetchSummary } from "@/lib/api/budget/summary";

export default function SummaryCards() {
  const [totalCurrent, setTotalCurrent] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  async function loadTotals() {
    try {
      setLoading(true);
      const summary = await fetchSummary();
      setTotalCurrent(summary.totalCurrent);
      setTotalIncome(summary.totalIncome);
      setTotalExpense(summary.totalExpense);
    } catch (err) {
      console.error("Error loading totals:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTotals();
    // Listen for transaction changes
    const handleChange = () => loadTotals();
    window.addEventListener("transaction-changed", handleChange);
    // Refresh every 30 seconds
    const interval = setInterval(loadTotals, 30000);
    return () => {
      window.removeEventListener("transaction-changed", handleChange);
      clearInterval(interval);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 shadow-lg animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-slate-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Total Current */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-lg">
        <div className="text-sm text-slate-500 mb-1">Total Current</div>
        <div className={`text-2xl font-semibold ${totalCurrent >= 0 ? "text-emerald-600" : "text-red-600"}`}>
          {formatCurrency(totalCurrent)}
        </div>
      </div>

      {/* Total Income */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-lg">
        <div className="text-sm text-slate-500 mb-1">Total Income</div>
        <div className="text-2xl font-semibold text-emerald-600">
          {formatCurrency(totalIncome)}
        </div>
      </div>

      {/* Total Expense */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-lg">
        <div className="text-sm text-slate-500 mb-1">Total Expense</div>
        <div className="text-2xl font-semibold text-red-600">
          {formatCurrency(totalExpense)}
        </div>
      </div>
    </div>
  );
}

