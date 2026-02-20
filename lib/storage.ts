// User data storage utilities
// Uses localStorage for persistence across sessions

import { LoanPlan, SavedPlanData, RuntimePlanData, mapToObject, objectToMap } from "@/lib/types/loan";

export interface UserPlansData {
  plans: LoanPlan[];
  savedPlansData: Record<string, SavedPlanData>;
}

export function saveUserData(email: string, plans: LoanPlan[], savedPlansData: Map<string, any>) {
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
            // Convert Map to plain object for JSON serialization
            oneTimePayments: planData.oneTimePayments instanceof Map
              ? mapToObject(planData.oneTimePayments)
              : planData.oneTimePayments,
          },
        ])
      ),
    };

    localStorage.setItem(`user_data_${email}`, JSON.stringify(data));
  } catch (error) {
    // Silent fail - localStorage operations should not break the app
  }
}

export function loadUserData(email: string): {
  plans: LoanPlan[];
  savedPlansData: Map<string, RuntimePlanData>;
} | null {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(`user_data_${email}`);
    if (!data) return null;

    const parsed = JSON.parse(data) as UserPlansData;

    // Convert plain object back to Map for oneTimePayments
    const savedPlansDataMap = new Map(
      Object.entries(parsed.savedPlansData).map(([planId, planData]) => [
        planId,
        {
          ...planData,
          oneTimePayments: objectToMap(planData.oneTimePayments),
        },
      ])
    );

    return {
      plans: parsed.plans,
      savedPlansData: savedPlansDataMap,
    };
  } catch (error) {
    // Silent fail - return null on error
    return null;
  }
}

export function clearUserData(email: string) {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(`user_data_${email}`);
  } catch (error) {
    // Silent fail
  }
}






