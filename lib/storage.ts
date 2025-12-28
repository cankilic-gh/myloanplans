// User data storage utilities
// Uses localStorage for persistence across sessions

import { LoanPlan } from "@/components/DashboardLayout";
import { MortgageInputs, MortgageResult, PaymentScheduleRow } from "@/utils/mortgageMath";

export interface UserPlansData {
  plans: LoanPlan[];
  savedPlansData: Record<string, {
    inputs: MortgageInputs;
    result?: MortgageResult; // Optional - can save inputs without calculating
    updatedSchedule?: PaymentScheduleRow[];
    oneTimePayments: Array<[number, number]>;
    paidMonths?: number; // Track paid months per plan
  }>;
}

export function saveUserData(email: string, plans: any[], savedPlansData: Map<string, any>) {
  if (typeof window === "undefined") return;

  try {
    const data: UserPlansData = {
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        createdAt: plan.createdAt,
      })),
      savedPlansData: Object.fromEntries(
        Array.from(savedPlansData.entries()).map(([planId, planData]) => [
          planId,
          {
            ...planData,
            // Convert Map to Array for JSON serialization
            oneTimePayments: Array.from(planData.oneTimePayments.entries()),
          },
        ])
      ),
    };

    localStorage.setItem(`user_data_${email}`, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save user data:", error);
  }
}

export function loadUserData(email: string): {
  plans: LoanPlan[];
  savedPlansData: Map<string, {
    inputs: MortgageInputs;
    result?: MortgageResult; // Optional - can save inputs without calculating
    updatedSchedule?: PaymentScheduleRow[];
    oneTimePayments: Map<number, number>;
  }>;
} | null {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(`user_data_${email}`);
    if (!data) return null;

    const parsed = JSON.parse(data) as UserPlansData;
    
    // Convert Array back to Map for oneTimePayments
    const savedPlansDataMap = new Map(
      Object.entries(parsed.savedPlansData).map(([planId, planData]) => [
        planId,
        {
          ...planData,
          oneTimePayments: new Map(planData.oneTimePayments),
        },
      ])
    );

    return {
      plans: parsed.plans,
      savedPlansData: savedPlansDataMap,
    };
  } catch (error) {
    console.error("Failed to load user data:", error);
    return null;
  }
}

export function clearUserData(email: string) {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(`user_data_${email}`);
  } catch (error) {
    console.error("Failed to clear user data:", error);
  }
}

