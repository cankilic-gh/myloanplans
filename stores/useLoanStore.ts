"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  generateAmortizationSchedule,
  recalculateScheduleFromMonth,
  type MortgageInputs,
  type MortgageResult,
  type PaymentScheduleRow,
} from "@/utils/mortgageMath";
import { uid, nowISO } from "@/lib/local/uid";

export interface LoanPlanMeta {
  id: string;
  name: string;
  startDate: string; // ISO
  createdAt: string;
}

export interface LoanPlanRuntime {
  inputs: MortgageInputs;
  oneTimePayments: Record<number, number>; // month -> amount
  paidMonths: number;
}

const defaultInputs: MortgageInputs = {
  principal: 400000,
  annualInterestRate: 6.5,
  loanTermMonths: 360,
  downPayment: 80000,
  recurringExtraPayment: 0,
};

const round2 = (n: number) => Math.round(n * 100) / 100;

// Rebuild the full schedule from inputs + one-time payments, preserving exact math.
export function buildSchedule(
  inputs: MortgageInputs,
  oneTimePayments: Record<number, number>
): MortgageResult {
  const base = generateAmortizationSchedule(inputs);
  if (base.schedule.length === 0) return base;

  const monthlyRate = inputs.annualInterestRate / 100 / 12;
  const recurringExtra = inputs.recurringExtraPayment ?? 0;
  let schedule: PaymentScheduleRow[] = base.schedule;

  const months = Object.keys(oneTimePayments)
    .map(Number)
    .filter((m) => (oneTimePayments[m] ?? 0) > 0)
    .sort((a, b) => a - b);

  for (const m of months) {
    schedule = recalculateScheduleFromMonth(
      schedule,
      m,
      oneTimePayments[m],
      monthlyRate,
      base.monthlyPayment,
      recurringExtra
    );
  }

  const totalInterest = schedule.reduce((s, r) => s + r.interestPayment, 0);
  const loanAmount = Math.max(0, inputs.principal - (inputs.downPayment ?? 0));

  return {
    monthlyPayment: base.monthlyPayment,
    totalInterest: round2(totalInterest),
    totalPayment: round2(totalInterest + loanAmount),
    schedule,
    finalMonth:
      schedule.length < inputs.loanTermMonths ? schedule.length : undefined,
  };
}

interface LoanState {
  hydrated: boolean;
  setHydrated: () => void;
  plans: LoanPlanMeta[];
  runtime: Record<string, LoanPlanRuntime>;
  activePlanId: string | null;

  createPlan: (name?: string) => string;
  deletePlan: (id: string) => void;
  renamePlan: (id: string, name: string, startDate?: string) => void;
  setActivePlan: (id: string) => void;

  updateInputs: (id: string, patch: Partial<MortgageInputs>) => void;
  setOneTimePayment: (id: string, month: number, amount: number) => void;
  setPaidMonths: (id: string, paidMonths: number) => void;
}

function freshRuntime(): LoanPlanRuntime {
  return { inputs: { ...defaultInputs }, oneTimePayments: {}, paidMonths: 0 };
}

export const useLoanStore = create<LoanState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      plans: [],
      runtime: {},
      activePlanId: null,

      createPlan: (name) => {
        const id = uid("plan");
        const meta: LoanPlanMeta = {
          id,
          name: name?.trim() || `Loan Plan ${get().plans.length + 1}`,
          startDate: nowISO(),
          createdAt: nowISO(),
        };
        set((s) => ({
          plans: [...s.plans, meta],
          runtime: { ...s.runtime, [id]: freshRuntime() },
          activePlanId: id,
        }));
        return id;
      },
      deletePlan: (id) =>
        set((s) => {
          const plans = s.plans.filter((p) => p.id !== id);
          const runtime = { ...s.runtime };
          delete runtime[id];
          return {
            plans,
            runtime,
            activePlanId: s.activePlanId === id ? plans[0]?.id ?? null : s.activePlanId,
          };
        }),
      renamePlan: (id, name, startDate) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === id ? { ...p, name, ...(startDate ? { startDate } : {}) } : p
          ),
        })),
      setActivePlan: (id) => set({ activePlanId: id }),

      updateInputs: (id, patch) =>
        set((s) => {
          const rt = s.runtime[id] ?? freshRuntime();
          return {
            runtime: {
              ...s.runtime,
              [id]: { ...rt, inputs: { ...rt.inputs, ...patch } },
            },
          };
        }),
      setOneTimePayment: (id, month, amount) =>
        set((s) => {
          const rt = s.runtime[id] ?? freshRuntime();
          const otp = { ...rt.oneTimePayments };
          if (amount > 0) otp[month] = amount;
          else delete otp[month];
          return { runtime: { ...s.runtime, [id]: { ...rt, oneTimePayments: otp } } };
        }),
      setPaidMonths: (id, paidMonths) =>
        set((s) => {
          const rt = s.runtime[id] ?? freshRuntime();
          return { runtime: { ...s.runtime, [id]: { ...rt, paidMonths } } };
        }),
    }),
    {
      name: "mlp_loans_v1",
      onRehydrateStorage: () => (state) => state?.setHydrated(),
      partialize: (s) => ({
        plans: s.plans,
        runtime: s.runtime,
        activePlanId: s.activePlanId,
      }),
    }
  )
);
