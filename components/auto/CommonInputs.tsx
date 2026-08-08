"use client";

import { Car } from "lucide-react";
import { useAutoStore } from "@/stores/useAutoStore";
import { HORIZON_MAX_YEARS, HORIZON_MIN_YEARS } from "@/lib/auto/autoMath";
import { NumberField, TextField, SliderNumberField, SectionHeader, PresetRow } from "./fields";

const HORIZON_PRESETS = [
  { label: "3 yr", value: 3 },
  { label: "5 yr", value: 5 },
  { label: "10 yr", value: 10 },
];

export function CommonInputs() {
  const { inputs, updateCommon } = useAutoStore();
  const { common } = inputs;

  return (
    <div className="card-premium p-5 sm:p-6 space-y-4">
      <SectionHeader
        icon={<Car className="w-4 h-4 text-brand" />}
        title="Vehicle & Horizon"
        subtitle="Shared setup — feeds both the Finance and Lease scenarios below"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TextField
          id="vehicleName"
          label="Vehicle / Model"
          value={common.vehicleName}
          onCommit={(v) => updateCommon({ vehicleName: v })}
          placeholder="Tesla Model 3"
        />

        <NumberField
          id="purchasePrice"
          label="Purchase Price (MSRP)"
          prefix="$"
          value={common.purchasePrice}
          onCommit={(n) => updateCommon({ purchasePrice: n })}
          placeholder="42,490"
          step="100"
        />

        <NumberField
          id="annualMiles"
          label="Annual Miles Driven"
          suffix="mi/yr"
          value={common.annualMiles}
          onCommit={(n) => updateCommon({ annualMiles: n })}
          placeholder="10,000"
          step="500"
        />

        <NumberField
          id="salesTaxPct"
          label="Sales Tax Rate"
          sublabel="price (finance) & payment (lease)"
          suffix="%"
          value={common.salesTaxPct}
          onCommit={(n) => updateCommon({ salesTaxPct: n })}
          placeholder="7.00"
          step="0.1"
          max="20"
        />

        <NumberField
          id="regDocFees"
          label="Registration / Doc Fees"
          sublabel="finance scenario, one-time"
          prefix="$"
          value={common.regDocFees}
          onCommit={(n) => updateCommon({ regDocFees: n })}
          placeholder="500"
          step="10"
        />

        <NumberField
          id="insuranceDelta"
          label="Insurance Difference"
          sublabel="lease minus finance, $/yr"
          prefix="$"
          allowNegative
          value={common.annualInsuranceDeltaLeaseMinusFinance}
          onCommit={(n) => updateCommon({ annualInsuranceDeltaLeaseMinusFinance: n })}
          placeholder="0"
          step="10"
        />

        <div className="sm:col-span-2 space-y-2">
          <PresetRow
            options={HORIZON_PRESETS}
            active={common.horizonYears}
            onSelect={(v) => updateCommon({ horizonYears: v })}
          />
          <SliderNumberField
            id="horizonYears"
            label="Comparison Horizon"
            value={common.horizonYears}
            onCommit={(n) => updateCommon({ horizonYears: Math.round(n) })}
            min={HORIZON_MIN_YEARS}
            max={HORIZON_MAX_YEARS}
            step={1}
            formatValue={(v) => `${v} yr`}
          />
        </div>
      </div>
    </div>
  );
}
