"use client";

import { Shuffle, RotateCcw } from "lucide-react";
import { useAutoStore } from "@/stores/useAutoStore";
import { VEHICLE_PRESETS } from "@/lib/auto/autoMath";

/**
 * Curated example-vehicle chooser + generic reset. Presets are a fixed,
 * hand-edited list (see VEHICLE_PRESETS) — nothing here fetches live data.
 */
export function VehiclePresetPicker() {
  const { activePresetId, applyPreset, shufflePreset, resetToGenericDefault } = useAutoStore();

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Example vehicle">
        {VEHICLE_PRESETS.map((p) => {
          const active = activePresetId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={active}
              onClick={() => applyPreset(p.id)}
              title={p.tagline}
              className={`h-9 px-3.5 rounded-xl border text-xs font-medium transition-colors ${
                active
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-card text-muted hover:border-border-strong hover:text-foreground"
              }`}
            >
              {p.vehicleName}
            </button>
          );
        })}
        <button
          type="button"
          onClick={shufflePreset}
          className="h-9 px-3.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground hover:border-brand hover:text-brand transition-colors flex items-center gap-1.5"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Shuffle example
        </button>
        <button
          type="button"
          onClick={resetToGenericDefault}
          className="h-9 px-3.5 rounded-xl border border-border bg-card text-xs font-medium text-muted hover:border-border-strong hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>
      <p className="text-[11px] text-muted">
        Illustrative market snapshots, not live quotes — every value is editable · last reviewed Aug 2026
      </p>
    </div>
  );
}
