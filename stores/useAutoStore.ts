"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  TESLA_EXAMPLE_INPUTS,
  GENERIC_DEFAULT_INPUTS,
  TESLA_MODEL_3_DEPRECIATION_CURVE,
  TOYOTA_RAV4_DEPRECIATION_CURVE,
  VEHICLE_PRESETS,
  DEFAULT_VEHICLE_PRESET_ID,
  sanitizeDepreciationCurve,
  clampHorizonYears,
  clampFinanceTermMonths,
  clampLeaseTermMonths,
  type AutoInputs,
  type AutoCommonInputs,
  type AutoFinanceInputs,
  type AutoLeaseInputs,
  type DepreciationMode,
  type VehiclePreset,
} from "@/lib/auto/autoMath";

function cloneDefaults(): AutoInputs {
  return {
    common: { ...TESLA_EXAMPLE_INPUTS.common },
    finance: { ...TESLA_EXAMPLE_INPUTS.finance },
    lease: { ...TESLA_EXAMPLE_INPUTS.lease },
    depreciationMode: TESLA_EXAMPLE_INPUTS.depreciationMode,
    depreciationCurve: [...TESLA_EXAMPLE_INPUTS.depreciationCurve],
  };
}

function inputsFromPreset(preset: VehiclePreset): AutoInputs {
  return {
    common: { ...preset.inputs.common },
    finance: { ...preset.inputs.finance },
    lease: { ...preset.inputs.lease },
    depreciationMode: preset.inputs.depreciationMode,
    depreciationCurve: [...preset.inputs.depreciationCurve],
  };
}

function sanitizeDepreciationMode(mode: unknown): DepreciationMode {
  return mode === "custom" || mode === "rav4" ? mode : "tesla";
}

function sanitizeActivePresetId(id: unknown): string | null {
  return typeof id === "string" && VEHICLE_PRESETS.some((p) => p.id === id) ? id : null;
}

/** Merge persisted (possibly stale/partial) state onto fresh defaults so schema drift never crashes. */
function sanitizeInputs(partial: Partial<AutoInputs> | null | undefined): AutoInputs {
  const base = cloneDefaults();
  if (!partial || typeof partial !== "object") return base;
  return {
    common: { ...base.common, ...(partial.common ?? {}) },
    finance: { ...base.finance, ...(partial.finance ?? {}) },
    lease: { ...base.lease, ...(partial.lease ?? {}) },
    depreciationMode: sanitizeDepreciationMode(partial.depreciationMode),
    depreciationCurve: sanitizeDepreciationCurve(
      Array.isArray(partial.depreciationCurve) && partial.depreciationCurve.length > 0
        ? partial.depreciationCurve
        : base.depreciationCurve
    ),
  };
}

interface AutoState {
  hydrated: boolean;
  setHydrated: () => void;
  inputs: AutoInputs;
  activePresetId: string | null;

  updateCommon: (patch: Partial<AutoCommonInputs>) => void;
  updateFinance: (patch: Partial<AutoFinanceInputs>) => void;
  updateLease: (patch: Partial<AutoLeaseInputs>) => void;
  setDepreciationMode: (mode: DepreciationMode) => void;
  setDepreciationCurve: (curve: number[]) => void;
  setDepreciationYear: (yearIndex: number, pct: number) => void;
  applyPreset: (presetId: string) => void;
  shufflePreset: () => void;
  resetToGenericDefault: () => void;
}

export const useAutoStore = create<AutoState>()(
  persist(
    (set) => ({
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      inputs: cloneDefaults(),
      activePresetId: DEFAULT_VEHICLE_PRESET_ID,

      // Any manual edit means the inputs no longer exactly match whatever
      // preset (if any) they started from, so the picker must stop
      // highlighting that preset as active — otherwise it falsely implies
      // the edited values are still the curated snapshot.
      updateCommon: (patch) =>
        set((s) => {
          const common = { ...s.inputs.common, ...patch };
          if (patch.horizonYears !== undefined) common.horizonYears = clampHorizonYears(common.horizonYears);
          return { activePresetId: null, inputs: { ...s.inputs, common } };
        }),

      updateFinance: (patch) =>
        set((s) => {
          const finance = { ...s.inputs.finance, ...patch };
          if (patch.termMonths !== undefined) finance.termMonths = clampFinanceTermMonths(finance.termMonths);
          return { activePresetId: null, inputs: { ...s.inputs, finance } };
        }),

      updateLease: (patch) =>
        set((s) => {
          const lease = { ...s.inputs.lease, ...patch };
          if (patch.leaseTermMonths !== undefined) lease.leaseTermMonths = clampLeaseTermMonths(lease.leaseTermMonths);
          return { activePresetId: null, inputs: { ...s.inputs, lease } };
        }),

      setDepreciationMode: (mode) =>
        set((s) => ({
          activePresetId: null,
          inputs: {
            ...s.inputs,
            depreciationMode: mode,
            depreciationCurve:
              mode === "tesla"
                ? [...TESLA_MODEL_3_DEPRECIATION_CURVE]
                : mode === "rav4"
                ? [...TOYOTA_RAV4_DEPRECIATION_CURVE]
                : s.inputs.depreciationCurve,
          },
        })),

      setDepreciationCurve: (curve) =>
        set((s) => ({
          activePresetId: null,
          inputs: {
            ...s.inputs,
            depreciationMode: "custom",
            depreciationCurve: sanitizeDepreciationCurve(curve),
          },
        })),

      setDepreciationYear: (yearIndex, pct) =>
        set((s) => {
          const next = [...s.inputs.depreciationCurve];
          next[yearIndex] = pct;
          return {
            activePresetId: null,
            inputs: {
              ...s.inputs,
              depreciationMode: "custom",
              depreciationCurve: sanitizeDepreciationCurve(next),
            },
          };
        }),

      applyPreset: (presetId) =>
        set(() => {
          const preset = VEHICLE_PRESETS.find((p) => p.id === presetId) ?? VEHICLE_PRESETS[0];
          return { activePresetId: preset.id, inputs: inputsFromPreset(preset) };
        }),

      shufflePreset: () =>
        set((s) => {
          const others = VEHICLE_PRESETS.filter((p) => p.id !== s.activePresetId);
          const pool = others.length > 0 ? others : VEHICLE_PRESETS;
          const preset = pool[Math.floor(Math.random() * pool.length)];
          return { activePresetId: preset.id, inputs: inputsFromPreset(preset) };
        }),

      resetToGenericDefault: () =>
        set({
          activePresetId: null,
          inputs: {
            common: { ...GENERIC_DEFAULT_INPUTS.common },
            finance: { ...GENERIC_DEFAULT_INPUTS.finance },
            lease: { ...GENERIC_DEFAULT_INPUTS.lease },
            depreciationMode: GENERIC_DEFAULT_INPUTS.depreciationMode,
            depreciationCurve: [...GENERIC_DEFAULT_INPUTS.depreciationCurve],
          },
        }),
    }),
    {
      name: "mlp_auto_v1",
      onRehydrateStorage: () => (state) => state?.setHydrated(),
      partialize: (s) => ({ inputs: s.inputs, activePresetId: s.activePresetId }),
      merge: (persisted, current) => {
        const p = persisted as
          | { inputs?: Partial<AutoInputs>; activePresetId?: unknown }
          | undefined;
        return {
          ...current,
          inputs: sanitizeInputs(p?.inputs),
          activePresetId: sanitizeActivePresetId(p?.activePresetId) ?? current.activePresetId,
        };
      },
    }
  )
);
