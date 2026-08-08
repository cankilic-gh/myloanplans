"use client";

import { KeySquare } from "lucide-react";
import { useAutoStore } from "@/stores/useAutoStore";
import { LEASE_TERM_MAX_MONTHS, LEASE_TERM_MIN_MONTHS } from "@/lib/auto/autoMath";
import { monthsToYears } from "@/lib/format";
import { NumberField, SliderNumberField, SectionHeader } from "./fields";

export function LeaseInputs() {
  const { inputs, updateLease } = useAutoStore();
  const { lease } = inputs;

  return (
    <div className="card-premium p-5 sm:p-6 space-y-5">
      <SectionHeader
        icon={<KeySquare className="w-4 h-4 text-brand" />}
        title="Lease Scenario"
        subtitle="Repeat comparable new leases to horizon · return at term end"
      />

      <div className="space-y-4">
        <NumberField
          id="leaseMonthly"
          label="Monthly Payment"
          prefix="$"
          value={lease.monthlyPayment}
          onCommit={(n) => updateLease({ monthlyPayment: n })}
          placeholder="299"
          step="5"
        />

        <SliderNumberField
          id="leaseTerm"
          label="Lease Term (per cycle)"
          value={lease.leaseTermMonths}
          onCommit={(n) => updateLease({ leaseTermMonths: Math.round(n) })}
          min={LEASE_TERM_MIN_MONTHS}
          max={LEASE_TERM_MAX_MONTHS}
          step={3}
          formatValue={(v) => monthsToYears(v)}
        />

        <NumberField
          id="dueAtSigning"
          label="Due at Signing"
          sublabel="total drive-off incl. 1st payment, excl. acquisition fee"
          prefix="$"
          value={lease.dueAtSigning}
          onCommit={(n) => updateLease({ dueAtSigning: n })}
          placeholder="2,999"
          step="50"
        />

        <div className="grid grid-cols-2 gap-3">
          <NumberField
            id="acquisitionFee"
            label="Acquisition Fee"
            prefix="$"
            value={lease.acquisitionFee}
            onCommit={(n) => updateLease({ acquisitionFee: n })}
            placeholder="0"
            step="10"
          />
          <NumberField
            id="dispositionFee"
            label="Disposition Fee"
            prefix="$"
            value={lease.dispositionFee}
            onCommit={(n) => updateLease({ dispositionFee: n })}
            placeholder="395"
            step="10"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <NumberField
            id="includedMiles"
            label="Included Miles"
            suffix="mi/yr"
            value={lease.includedMilesPerYear}
            onCommit={(n) => updateLease({ includedMilesPerYear: n })}
            placeholder="10,000"
            step="500"
          />
          <NumberField
            id="excessMileRate"
            label="Excess Mile Rate"
            prefix="$"
            suffix="/mi"
            value={lease.excessMileRate}
            onCommit={(n) => updateLease({ excessMileRate: n })}
            placeholder="0.25"
            step="0.01"
          />
        </div>

        <NumberField
          id="leaseMaintenance"
          label="Annual Maintenance"
          sublabel="typically lower — under warranty"
          prefix="$"
          suffix="/yr"
          value={lease.annualMaintenance}
          onCommit={(n) => updateLease({ annualMaintenance: n })}
          placeholder="200"
          step="25"
        />

        <NumberField
          id="cycleEscalation"
          label="Replacement Lease Escalation"
          sublabel="cost increase per new cycle"
          suffix="%"
          value={lease.cycleEscalationPct}
          onCommit={(n) => updateLease({ cycleEscalationPct: n })}
          placeholder="3.0"
          step="0.5"
          max="25"
        />
      </div>
    </div>
  );
}
