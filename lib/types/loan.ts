import { MortgageInputs, MortgageResult, PaymentScheduleRow } from "@/utils/mortgageMath";

// Base plan data interface (for serialization - uses plain object)
export interface SavedPlanData {
  inputs: MortgageInputs;
  result?: MortgageResult;
  updatedSchedule?: PaymentScheduleRow[];
  oneTimePayments: Record<number, number>; // Plain object for JSON serialization
  paidMonths?: number;
}

// Runtime plan data interface (uses Map for oneTimePayments)
export interface RuntimePlanData {
  inputs: MortgageInputs;
  result?: MortgageResult;
  updatedSchedule?: PaymentScheduleRow[];
  oneTimePayments: Map<number, number>; // Map for runtime operations
  paidMonths?: number;
}

// Runtime helper to convert from Map to plain object
export function mapToObject(map: Map<number, number>): Record<number, number> {
  const obj: Record<number, number> = {};
  map.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

// Runtime helper to convert from plain object to Map
export function objectToMap(obj: Record<number, number> | undefined): Map<number, number> {
  if (!obj) return new Map();
  const map = new Map<number, number>();
  Object.entries(obj).forEach(([key, value]) => {
    map.set(Number(key), value);
  });
  return map;
}

// LoanPlan type used for UI display
export interface LoanPlan {
  id: string;
  name: string;
  createdAt: string;
}
