"use client";

import { useState, useEffect, useCallback } from "react";
import { Home, Percent, Calendar, TrendingDown, DollarSign } from "lucide-react";
import { useLoanStore } from "@/stores/useLoanStore";
import type { MortgageInputs } from "@/utils/mortgageMath";
import { monthsToYears } from "@/lib/format";

// ─── Labeled input with optional prefix icon ──────────────────────────────────
interface FieldProps {
  id: string;
  label: string;
  sublabel?: string;
  prefix?: React.ReactNode;
  suffix?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
}

function Field({
  id, label, sublabel, prefix, suffix, value, onChange,
  type = "number", placeholder, min, max, step,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {sublabel && (
          <span className="text-xs text-muted balance-num">{sublabel}</span>
        )}
      </div>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-muted pointer-events-none select-none text-sm">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`w-full h-11 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all balance-num placeholder:text-muted/50 ${
            prefix ? "pl-8" : "pl-3"
          } ${suffix ? "pr-12" : "pr-3"}`}
        />
        {suffix && (
          <span className="absolute right-3 text-muted pointer-events-none select-none text-sm">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── InputPanel ───────────────────────────────────────────────────────────────
export function InputPanel() {
  const { activePlanId, runtime, updateInputs } = useLoanStore();

  const rt = activePlanId ? runtime[activePlanId] : null;
  const inputs: MortgageInputs = rt?.inputs ?? {
    principal: 400000,
    annualInterestRate: 6.5,
    loanTermMonths: 360,
    downPayment: 80000,
    recurringExtraPayment: 0,
  };

  // Local string state for all fields
  const [principal, setPrincipal] = useState(String(inputs.principal));
  const [rate, setRate] = useState(String(inputs.annualInterestRate));
  const [termMonths, setTermMonths] = useState(String(inputs.loanTermMonths));
  const [downDollar, setDownDollar] = useState(String(inputs.downPayment ?? ""));
  const [downPct, setDownPct] = useState(() => {
    const dp = inputs.downPayment ?? 0;
    const p = inputs.principal;
    return p > 0 && dp > 0 ? ((dp / p) * 100).toFixed(2) : "";
  });
  const [extra, setExtra] = useState(String(inputs.recurringExtraPayment ?? ""));

  // Sync local state when plan switches
  useEffect(() => {
    if (!rt) return;
    const i = rt.inputs;
    setPrincipal(String(i.principal));
    setRate(String(i.annualInterestRate));
    setTermMonths(String(i.loanTermMonths));
    setDownDollar(String(i.downPayment ?? ""));
    const dp = i.downPayment ?? 0;
    setDownPct(i.principal > 0 && dp > 0 ? ((dp / i.principal) * 100).toFixed(2) : "");
    setExtra(String(i.recurringExtraPayment ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlanId]);

  // Debounced store write
  const commit = useCallback(
    (patch: Partial<MortgageInputs>) => {
      if (!activePlanId) return;
      updateInputs(activePlanId, patch);
    },
    [activePlanId, updateInputs]
  );

  // ── Field handlers ──────────────────────────────────────────────────────────
  const handlePrincipal = (v: string) => {
    setPrincipal(v);
    const p = parseFloat(v) || 0;
    // Keep down payment dollar, recalc pct
    const dp = parseFloat(downDollar) || 0;
    if (p > 0 && dp >= 0) {
      setDownPct(((dp / p) * 100).toFixed(2));
    }
    commit({ principal: p });
  };

  const handleRate = (v: string) => {
    setRate(v);
    commit({ annualInterestRate: parseFloat(v) || 0 });
  };

  const handleTerm = (v: string) => {
    setTermMonths(v);
    const t = Math.min(600, Math.max(1, parseInt(v) || 1));
    commit({ loanTermMonths: t });
  };

  const handleDownDollar = (v: string) => {
    setDownDollar(v);
    const dp = parseFloat(v) || 0;
    const p = parseFloat(principal) || 0;
    if (p > 0) setDownPct(((dp / p) * 100).toFixed(2));
    commit({ downPayment: dp });
  };

  const handleDownPct = (v: string) => {
    setDownPct(v);
    const pct = parseFloat(v) || 0;
    const p = parseFloat(principal) || 0;
    const dp = (pct / 100) * p;
    setDownDollar(dp.toFixed(0));
    commit({ downPayment: dp });
  };

  const handleExtra = (v: string) => {
    setExtra(v);
    commit({ recurringExtraPayment: parseFloat(v) || 0 });
  };

  const termNum = parseInt(termMonths) || 0;

  return (
    <div className="card-premium p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
          <Home className="w-4 h-4 text-brand" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">Loan Inputs</p>
          <p className="text-xs text-muted">Changes apply instantly</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Principal */}
        <Field
          id="principal"
          label="Principal Amount"
          prefix="$"
          value={principal}
          onChange={handlePrincipal}
          placeholder="400,000"
          min="0"
          step="1000"
        />

        {/* Rate */}
        <Field
          id="rate"
          label="Annual Interest Rate"
          suffix="%"
          value={rate}
          onChange={handleRate}
          placeholder="6.50"
          min="0"
          max="100"
          step="0.01"
        />

        {/* Term */}
        <Field
          id="term"
          label="Loan Term"
          sublabel={termNum > 0 ? monthsToYears(termNum) : undefined}
          suffix="mo"
          value={termMonths}
          onChange={handleTerm}
          placeholder="360"
          min="1"
          max="600"
          step="1"
        />

        {/* Down payment — two synced inputs */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Down Payment</label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted pointer-events-none text-sm">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
              <input
                id="downDollar"
                type="number"
                value={downDollar}
                onChange={(e) => handleDownDollar(e.target.value)}
                placeholder="80,000"
                min="0"
                step="1000"
                className="w-full h-11 pl-8 pr-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all balance-num placeholder:text-muted/50"
              />
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted pointer-events-none text-sm">
                <Percent className="w-3.5 h-3.5" />
              </span>
              <input
                id="downPct"
                type="number"
                value={downPct}
                onChange={(e) => handleDownPct(e.target.value)}
                placeholder="20.00"
                min="0"
                max="100"
                step="0.1"
                className="w-full h-11 pl-8 pr-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all balance-num placeholder:text-muted/50"
              />
            </div>
          </div>
        </div>

        {/* Recurring extra payment */}
        <Field
          id="extra"
          label="Extra Payment / Month"
          prefix="+"
          suffix="$/mo"
          value={extra}
          onChange={handleExtra}
          placeholder="0"
          min="0"
          step="10"
        />
      </div>

      {/* Summary hint row */}
      {!activePlanId && (
        <p className="text-xs text-muted text-center pt-1">
          Create or select a plan above to save inputs.
        </p>
      )}
    </div>
  );
}
