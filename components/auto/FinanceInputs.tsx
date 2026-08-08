"use client";

import { Landmark } from "lucide-react";
import { useAutoStore } from "@/stores/useAutoStore";
import { FINANCE_TERM_MAX_MONTHS, FINANCE_TERM_MIN_MONTHS } from "@/lib/auto/autoMath";
import { monthsToYears } from "@/lib/format";
import { NumberField, SliderNumberField, SectionHeader } from "./fields";

export function FinanceInputs() {
  const { inputs, updateFinance } = useAutoStore();
  const { finance } = inputs;

  return (
    <div className="card-premium p-5 sm:p-6 space-y-5">
      <SectionHeader
        icon={<Landmark className="w-4 h-4 text-brand" />}
        title="Finance Scenario"
        subtitle="Buy once, hold to horizon"
      />

      <div className="space-y-4">
        <NumberField
          id="downPayment"
          label="Down Payment"
          prefix="$"
          value={finance.downPayment}
          onCommit={(n) => updateFinance({ downPayment: n })}
          placeholder="4,000"
          step="100"
        />

        <NumberField
          id="apr"
          label="Annual Percentage Rate"
          suffix="%"
          value={finance.apr}
          onCommit={(n) => updateFinance({ apr: n })}
          placeholder="5.49"
          step="0.01"
          max="30"
        />

        <SliderNumberField
          id="financeTerm"
          label="Loan Term"
          value={finance.termMonths}
          onCommit={(n) => updateFinance({ termMonths: Math.round(n) })}
          min={FINANCE_TERM_MIN_MONTHS}
          max={FINANCE_TERM_MAX_MONTHS}
          step={6}
          formatValue={(v) => monthsToYears(v)}
        />

        <NumberField
          id="financeFees"
          label="Finance / Origination Fees"
          sublabel="one-time, paid at signing"
          prefix="$"
          value={finance.financeFees}
          onCommit={(n) => updateFinance({ financeFees: n })}
          placeholder="150"
          step="10"
        />

        <NumberField
          id="financeMaintenance"
          label="Annual Maintenance & Repairs"
          prefix="$"
          suffix="/yr"
          value={finance.annualMaintenance}
          onCommit={(n) => updateFinance({ annualMaintenance: n })}
          placeholder="600"
          step="50"
        />
      </div>
    </div>
  );
}
