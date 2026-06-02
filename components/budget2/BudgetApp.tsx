"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  RefreshCw,
  PiggyBank,
  Receipt,
  Upload,
  Building2,
  Tag,
  BarChart2,
} from "lucide-react";
import { useBudgetStore } from "@/stores/useBudgetStore";
import { SummaryCards } from "./SummaryCards";
import { YearlyProjection } from "./YearlyProjection";
import { MonthlyProjectionTable } from "./MonthlyProjectionTable";
import { CashFlowChart } from "./CashFlowChart";
import { RecurringSection } from "./RecurringSection";
import { SavingsSection } from "./SavingsSection";
import { TransactionsSection } from "./TransactionsSection";
import { CsvImportModal } from "./CsvImportModal";
import { AccountsSection } from "./AccountsSection";
import { CategoriesSection } from "./CategoriesSection";
import { CollapsibleCard } from "./ui";

const THIS_YEAR = new Date().getFullYear();

// ------- Section nav items -------

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "recurring", label: "Recurring", icon: RefreshCw },
  { id: "savings", label: "Savings", icon: PiggyBank },
  { id: "transactions", label: "Transactions", icon: Receipt },
  { id: "accounts", label: "Accounts", icon: Building2 },
  { id: "categories", label: "Categories", icon: Tag },
] as const;

type SectionId = (typeof NAV_ITEMS)[number]["id"];

// ------- Skeleton guard -------

const HydrationSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 rounded-2xl bg-foreground/[0.06]" />
      ))}
    </div>
    <div className="h-64 rounded-2xl bg-foreground/[0.06]" />
    <div className="h-48 rounded-2xl bg-foreground/[0.06]" />
  </div>
);

// ------- Main BudgetApp -------

export const BudgetApp: React.FC = () => {
  const hydrated = useBudgetStore((s) => s.hydrated);
  const accounts = useBudgetStore((s) => s.accounts);
  const addAccount = useBudgetStore((s) => s.addAccount);

  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [selectedYear, setSelectedYear] = useState(THIS_YEAR);
  const [csvOpen, setCsvOpen] = useState(false);
  const initialized = useRef(false);

  // SSR guard
  useEffect(() => { setMounted(true); }, []);

  // Auto-create default account on first load
  useEffect(() => {
    if (!hydrated || initialized.current) return;
    initialized.current = true;
    if (accounts.length === 0) {
      addAccount("Main Account");
    }
  }, [hydrated, accounts.length, addAccount]);

  if (!mounted || !hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <HydrationSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Budget{" "}
              <span className="text-gradient">Planner</span>
            </h1>
            <p className="mt-1 text-sm text-muted">
              Private · no signup · data stays in your browser
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCsvOpen(true)}
            className="self-start sm:self-auto inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-border bg-card hover:border-border-strong text-sm font-medium text-foreground transition-all"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
        </div>

        {/* Section nav */}
        <nav className="flex gap-1 overflow-x-auto scroll-thin pb-2 mb-8 -mx-1 px-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={`relative flex items-center gap-2 h-9 px-3.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                activeSection === id
                  ? "bg-foreground/[0.06] text-foreground"
                  : "text-muted hover:text-foreground hover:bg-foreground/[0.03]"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {activeSection === id && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl bg-foreground/[0.06] -z-10"
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* ---------- DASHBOARD SECTION ---------- */}
        {activeSection === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {/* Summary cards */}
            <SummaryCards />

            {/* Yearly projection + year selector */}
            <section>
              <YearlyProjection
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
              />
            </section>

            {/* Chart */}
            <CollapsibleCard
              title="Income vs Expenses"
              defaultOpen
              action={
                <span className="text-xs text-muted">{selectedYear}</span>
              }
            >
              <CashFlowChart selectedYear={selectedYear} />
            </CollapsibleCard>

            {/* Monthly projection table */}
            <CollapsibleCard
              title="Monthly Cash Flow"
              defaultOpen={false}
            >
              <MonthlyProjectionTable selectedYear={selectedYear} />
            </CollapsibleCard>
          </motion.div>
        )}

        {/* ---------- RECURRING SECTION ---------- */}
        {activeSection === "recurring" && (
          <motion.div
            key="recurring"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="card-premium p-5">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-5 h-5 text-brand" />
                <h2 className="text-base font-semibold text-foreground">Recurring Income & Expenses</h2>
              </div>
              <p className="text-sm text-muted mb-5">
                Items here feed the monthly projection. Biweekly = 26× per year.
              </p>
              <RecurringSection />
            </div>
          </motion.div>
        )}

        {/* ---------- SAVINGS SECTION ---------- */}
        {activeSection === "savings" && (
          <motion.div
            key="savings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <PiggyBank className="w-5 h-5 text-mint" />
                <h2 className="text-base font-semibold text-foreground">Savings Goals</h2>
              </div>
              <p className="text-sm text-muted">
                Compound interest projections. Add extra one-off contributions at any time.
              </p>
            </div>
            <SavingsSection />
          </motion.div>
        )}

        {/* ---------- TRANSACTIONS SECTION ---------- */}
        {activeSection === "transactions" && (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="card-premium p-5">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="w-5 h-5 text-gold" />
                <h2 className="text-base font-semibold text-foreground">One-Off Transactions</h2>
              </div>
              <p className="text-sm text-muted mb-5">
                Single income or expense entries. Appear as one-offs in the monthly projection.
              </p>
              <TransactionsSection />
            </div>
          </motion.div>
        )}

        {/* ---------- ACCOUNTS SECTION ---------- */}
        {activeSection === "accounts" && (
          <motion.div
            key="accounts"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="card-premium p-5">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-lavender" />
                <h2 className="text-base font-semibold text-foreground">Bank Accounts</h2>
              </div>
              <p className="text-sm text-muted mb-5">
                Add accounts to organize transactions. Deleting an account removes its transactions.
              </p>
              <AccountsSection />
            </div>
          </motion.div>
        )}

        {/* ---------- CATEGORIES SECTION ---------- */}
        {activeSection === "categories" && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="card-premium p-5">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="w-5 h-5 text-rose" />
                <h2 className="text-base font-semibold text-foreground">Categories</h2>
              </div>
              <p className="text-sm text-muted mb-5">
                Income and expense categories. Assign them to transactions and recurring items.
              </p>
              <CategoriesSection />
            </div>
          </motion.div>
        )}
      </div>

      {/* CSV Import Modal */}
      <CsvImportModal open={csvOpen} onClose={() => setCsvOpen(false)} />
    </>
  );
};
