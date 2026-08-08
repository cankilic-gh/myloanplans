"use client";

import { TrendingDown, RotateCcw } from "lucide-react";
import { useAutoStore } from "@/stores/useAutoStore";
import { getDepreciationSourceLabel, type DepreciationMode } from "@/lib/auto/autoMath";
import { formatCompact } from "@/lib/format";
import { SectionHeader } from "./fields";

const MODE_OPTIONS: { mode: DepreciationMode; label: string }[] = [
  { mode: "tesla", label: "Tesla Model 3" },
  { mode: "rav4", label: "Toyota RAV4" },
  { mode: "custom", label: "Custom" },
];

export function DepreciationEditor() {
  const { inputs, setDepreciationMode, setDepreciationYear } = useAutoStore();
  const { depreciationMode, depreciationCurve, common } = inputs;

  return (
    <details className="card-premium overflow-hidden group" open={false}>
      <summary className="cursor-pointer list-none px-5 sm:px-6 py-4 flex items-center justify-between gap-3 hover:bg-foreground/[0.02] transition-colors">
        <SectionHeader
          icon={<TrendingDown className="w-4 h-4 text-brand" />}
          title="Depreciation Curve"
          subtitle="Retained value used to estimate resale at your horizon"
        />
        <span className="text-xs text-muted shrink-0 transition-transform group-open:rotate-180">▾</span>
      </summary>

      <div className="border-t border-border px-5 sm:px-6 py-5 space-y-4">
        <div className="flex gap-2">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.mode}
              type="button"
              onClick={() => setDepreciationMode(opt.mode)}
              className={`flex-1 h-9 rounded-lg text-xs font-semibold border transition-colors ${
                depreciationMode === opt.mode
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-card text-muted hover:border-border-strong hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted leading-relaxed">
          Percentages are illustrative retained-value estimates applied to{" "}
          <span className="text-foreground font-medium">your entered purchase price</span> — not a live
          quote for any specific car. Source: {getDepreciationSourceLabel(depreciationMode)}.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {depreciationCurve.map((pct, i) => (
            <div key={i} className="space-y-1">
              <label htmlFor={`dep-year-${i}`} className="text-[10px] font-medium text-muted block">
                Year {i + 1}
              </label>
              <div className="relative flex items-center">
                <input
                  id={`dep-year-${i}`}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={pct}
                  disabled={depreciationMode !== "custom"}
                  onChange={(e) => setDepreciationYear(i, parseFloat(e.target.value) || 0)}
                  className="w-full h-9 pl-2 pr-6 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all balance-num disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <span className="absolute right-2 text-[10px] text-muted pointer-events-none">%</span>
              </div>
              <p className="text-[10px] text-muted balance-num">
                ≈ {formatCompact((common.purchasePrice * pct) / 100)}
              </p>
            </div>
          ))}
        </div>

        {depreciationMode === "custom" && (
          <button
            type="button"
            onClick={() => setDepreciationMode("tesla")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to Tesla Model 3 curve
          </button>
        )}
      </div>
    </details>
  );
}
