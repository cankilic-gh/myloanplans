"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAutoStore } from "@/stores/useAutoStore";
import {
  computeAtHorizon,
  buildYearSeries,
  findBreakEvenYear,
  clampHorizonYears,
} from "@/lib/auto/autoMath";
import { VehiclePresetPicker } from "./VehiclePresetPicker";
import { CommonInputs } from "./CommonInputs";
import { FinanceInputs } from "./FinanceInputs";
import { LeaseInputs } from "./LeaseInputs";
import { DepreciationEditor } from "./DepreciationEditor";
import { RecommendationCard } from "./RecommendationCard";
import { ResultsSummary } from "./ResultsSummary";
import { CostComparisonChart } from "./CostComparisonChart";
import { DepreciationBalanceChart } from "./DepreciationBalanceChart";
import { ScenarioTable } from "./ScenarioTable";
import { Methodology } from "./Methodology";

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-border rounded-xl w-72" />
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        <div className="h-[480px] bg-border rounded-2xl" />
        <div className="space-y-4">
          <div className="h-32 bg-border rounded-2xl" />
          <div className="h-72 bg-border rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function AutoApp() {
  const { hydrated, inputs } = useAutoStore();

  const horizonYears = clampHorizonYears(inputs.common.horizonYears);

  const result = useMemo(() => computeAtHorizon(inputs), [inputs]);
  const series = useMemo(() => buildYearSeries(inputs), [inputs]);
  const breakEvenYear = useMemo(() => findBreakEvenYear(inputs), [inputs]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Skeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="absolute inset-x-0 top-0 h-[480px] grid-overlay pointer-events-none" />

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative pt-4 pb-6 space-y-2"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Lease vs. <span className="text-gradient">Finance</span>
            </h1>
            <p className="text-muted text-sm sm:text-base max-w-2xl">
              Model whether it&apos;s cheaper to finance one car and hold it, or keep leasing comparable
              new cars, over a horizon you choose. Private — your inputs never leave this browser.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <VehiclePresetPicker />
          </div>
        </div>
      </motion.div>

      {/* Shared setup — full width, feeds both scenarios below */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6 pb-6"
      >
        <CommonInputs />
        <DepreciationEditor />
      </motion.div>

      {/* Two-column layout: Finance vs. Lease on the left, results on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start pb-16">
        {/* Left: exactly two scenarios — Finance and Lease */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:sticky lg:top-24 space-y-5"
        >
          <FinanceInputs />
          <LeaseInputs />
        </motion.div>

        {/* Right: results */}
        <div className="space-y-6 min-w-0">
          <RecommendationCard
            result={result}
            breakEvenYear={breakEvenYear}
            vehicleName={inputs.common.vehicleName}
          />
          <ResultsSummary result={result} />
          <CostComparisonChart series={series} horizonYears={horizonYears} />
          <DepreciationBalanceChart series={series} />
          <ScenarioTable inputs={inputs} />
          <Methodology />
        </div>
      </div>
    </div>
  );
}
