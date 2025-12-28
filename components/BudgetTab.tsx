"use client";

import { motion } from "framer-motion";
import SummaryCards from "@/components/budget/SummaryCards";
import AddTransactionForm from "@/components/budget/AddTransactionForm";
import RecurringExpenses from "@/components/budget/RecurringExpenses";
import TransactionsList from "@/components/budget/TransactionsList";
import Chart from "@/components/budget/Chart";
import CategoriesList from "@/components/budget/CategoriesList";

export default function BudgetTab() {
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="text-center sm:text-left space-y-2 flex-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
              Budget Overview
            </h1>
            <p className="text-base lg:text-lg text-slate-600">
              Track your income, expenses, and recurring payments to stay on top of your finances
            </p>
          </div>
        </motion.div>

        {/* Top row: Summary Cards */}
        <div className="mb-4">
          <SummaryCards />
        </div>

        {/* Middle row: Add transaction (left) and Chart (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          <AddTransactionForm />
          <Chart />
        </div>

        {/* Bottom row: Recurring Expenses (left) and Recent transactions (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecurringExpenses />
          <TransactionsList />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 gap-6">
          <CategoriesList />
        </div>
      </div>
    </div>
  );
}

