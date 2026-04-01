"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import YearlyProjectionCards from "@/components/budget/YearlyProjectionCards";
import RecurringExpenses from "@/components/budget/RecurringExpenses";
import SavingsTracker from "@/components/budget/SavingsTracker";
import MonthlyProjectionGrid from "@/components/budget/MonthlyProjectionGrid";
import Chart from "@/components/budget/Chart";
import OneOffTransactions from "@/components/budget/OneOffTransactions";

class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-lg border border-slate-200 p-6 text-center text-sm text-slate-400">
          Chart could not be loaded.
        </div>
      );
    }
    return this.props.children;
  }
}
import CategoriesList from "@/components/budget/CategoriesList";
import CsvUploadModal from "@/components/budget/CsvUploadModal";

export default function BudgetTab() {
  const [showCsvModal, setShowCsvModal] = useState(false);

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pt-6 pb-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.05),transparent_50%)]" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="text-center sm:text-left space-y-1 flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent leading-tight">
              Budget Management
            </h1>
            <p className="text-sm lg:text-base text-slate-600">
              Your Budget
            </p>
          </div>
          <button
            onClick={() => setShowCsvModal(true)}
            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Import CSV
          </button>
        </motion.div>

        {/* 1. Yearly Projection Cards (Hero) */}
        <YearlyProjectionCards />

        {/* 2. Recurring Income/Expenses (Core) */}
        <RecurringExpenses />

        {/* 3. Savings Tracker */}
        <SavingsTracker />

        {/* 4. Monthly Projection Grid */}
        <MonthlyProjectionGrid />
      </div>

      {showCsvModal && <CsvUploadModal onClose={() => setShowCsvModal(false)} />}
    </div>
  );
}
