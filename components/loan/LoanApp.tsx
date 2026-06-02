"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLoanStore, buildSchedule } from "@/stores/useLoanStore";
import { PlanBar } from "./PlanBar";
import { InputPanel } from "./InputPanel";
import { SummaryCards } from "./SummaryCards";
import { ProgressSection } from "./ProgressSection";
import { AmortizationGrid } from "./AmortizationGrid";

// ─── Skeleton while zustand is hydrating ────────────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-border rounded-xl w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-border rounded-2xl" />
        ))}
      </div>
      <div className="h-72 bg-border rounded-2xl" />
    </div>
  );
}

// ─── Hero number — monthly payment ──────────────────────────────────────────
function MonthlyHero({ value }: { value: number }) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return (
    <div className="text-center lg:text-left space-y-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        Monthly Payment
      </p>
      <p className="text-5xl sm:text-6xl font-bold balance-num text-gradient leading-none">
        {formatted}
      </p>
    </div>
  );
}

// ─── Main LoanApp ────────────────────────────────────────────────────────────
export function LoanApp() {
  const {
    hydrated,
    plans,
    activePlanId,
    runtime,
    createPlan,
  } = useLoanStore();

  // Guard SSR mismatch: wait for client mount + zustand hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-create a default plan on first visit
  useEffect(() => {
    if (hydrated && plans.length === 0) {
      createPlan("My Loan");
    }
  }, [hydrated, plans.length, createPlan]);

  // Derive active plan data
  const activePlan = useMemo(
    () => plans.find((p) => p.id === activePlanId) ?? null,
    [plans, activePlanId]
  );

  const activeRuntime = activePlanId ? runtime[activePlanId] : null;

  // Compute schedule reactively whenever inputs or one-time payments change
  const result = useMemo(() => {
    if (!activeRuntime) return null;
    return buildSchedule(activeRuntime.inputs, activeRuntime.oneTimePayments);
  }, [activeRuntime]);

  const paidMonths = activeRuntime?.paidMonths ?? 0;

  if (!mounted || !hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Skeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Grid overlay decoration */}
      <div className="absolute inset-x-0 top-0 h-[480px] grid-overlay pointer-events-none" />

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative pt-4 pb-8 space-y-2"
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Mortgage{" "}
          <span className="text-gradient">Calculator</span>
        </h1>
        <p className="text-muted text-sm sm:text-base max-w-2xl">
          Model any loan with extra payments, one-time payoffs, and a full amortization
          breakdown. Private — your data never leaves this browser.
        </p>
      </motion.div>

      {/* Plan switcher bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <PlanBar />
      </motion.div>

      {/* Two-column layout: sticky inputs on left, content on right */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* Left: sticky input panel */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="lg:sticky lg:top-24"
        >
          <InputPanel />
        </motion.div>

        {/* Right: results */}
        <div className="space-y-6 min-w-0">
          {result && activePlanId && (
            <>
              {/* Hero number */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="card-premium px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <MonthlyHero value={result.monthlyPayment} />
                <div className="flex flex-col items-start sm:items-end gap-1 text-xs text-muted">
                  <span>
                    Plan:{" "}
                    <span className="font-semibold text-foreground">
                      {activePlan?.name ?? "—"}
                    </span>
                  </span>
                  {activePlan?.startDate && (
                    <span>
                      Starting{" "}
                      {new Date(activePlan.startDate).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Stat cards + payoff simulator */}
              <SummaryCards result={result} activeId={activePlanId} />

              {/* Progress bar */}
              <ProgressSection result={result} paidMonths={paidMonths} />

              {/* Amortization table */}
              <AmortizationGrid
                result={result}
                activeId={activePlanId}
                planName={activePlan?.name ?? "loan"}
              />
            </>
          )}

          {!result && (
            <div className="card-premium px-6 py-16 text-center">
              <p className="text-muted text-sm">
                Fill in the loan inputs to see results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
