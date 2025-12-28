"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { LoanPlan } from "@/components/DashboardLayout";
import { InputSection } from "@/components/InputSection";
import { SummaryCard } from "@/components/SummaryCard";
import { AmortizationTable } from "@/components/AmortizationTable";
import { EmptyLoanState } from "@/components/EmptyLoanState";
import { EditLoanDialog } from "@/components/EditLoanDialog";
import { Button } from "@/components/ui/button";
import { Save, Trash2, Settings2 } from "lucide-react";
import { saveUserData, loadUserData } from "@/lib/storage";
import {
  MortgageInputs,
  MortgageResult,
  PaymentScheduleRow,
  generateAmortizationSchedule,
  recalculateScheduleFromMonth,
} from "@/utils/mortgageMath";

interface SavedPlanData {
  inputs: MortgageInputs;
  result?: MortgageResult;
  updatedSchedule?: PaymentScheduleRow[];
  oneTimePayments: Map<number, number>;
  paidMonths?: number;
}

interface LoanTabProps {
  plans: LoanPlan[];
  activePlanId: string | null;
  onPlanSelect: (planId: string) => void;
  onAddNewPlan: () => void;
  onPlansChange: (plans: LoanPlan[]) => void;
  userEmail: string;
}

export function LoanTab({
  plans,
  activePlanId,
  onPlanSelect,
  onAddNewPlan,
  onPlansChange,
  userEmail,
}: LoanTabProps) {
  const [result, setResult] = useState<MortgageResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [inputs, setInputs] = useState<MortgageInputs | null>(null);
  const [updatedSchedule, setUpdatedSchedule] = useState<PaymentScheduleRow[] | null>(null);
  const [oneTimePayments, setOneTimePayments] = useState<Map<number, number>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanPlan | null>(null);
  const [savedPlansData, setSavedPlansData] = useState<Map<string, SavedPlanData>>(new Map());

  // Load saved data on mount
  useEffect(() => {
    if (userEmail) {
      const savedData = loadUserData(userEmail);
      if (savedData) {
        setSavedPlansData(savedData.savedPlansData);
      }
    }
  }, [userEmail]);

  const currentPlanData = activePlanId ? savedPlansData.get(activePlanId) : null;
  const currentPlanPaidMonths = currentPlanData?.paidMonths ?? 0;

  const paidMonths = useMemo(() => {
    if (!activePlanId) return 0;
    const planData = savedPlansData.get(activePlanId);
    return planData?.paidMonths ?? 0;
  }, [activePlanId, currentPlanPaidMonths]);

  const applyOneTimePaymentsToSchedule = (
    baseSchedule: PaymentScheduleRow[],
    payments: Map<number, number>,
    monthlyRate: number,
    baseMonthlyPayment: number,
    recurringExtra: number
  ): PaymentScheduleRow[] => {
    if (payments.size === 0) return baseSchedule;

    let currentSchedule = [...baseSchedule];
    const sortedPayments = Array.from(payments.entries()).sort((a, b) => a[0] - b[0]);

    for (const [paymentMonth, paymentValue] of sortedPayments) {
      currentSchedule = recalculateScheduleFromMonth(
        currentSchedule,
        paymentMonth,
        paymentValue,
        monthlyRate,
        baseMonthlyPayment,
        recurringExtra
      );
    }

    return currentSchedule;
  };

  const activePlan = plans.find((p) => p.id === activePlanId);

  const handlePlanSelect = useCallback((planId: string) => {
    if (planId === activePlanId) return;
    onPlanSelect(planId);
  }, [activePlanId, onPlanSelect]);

  // Load saved data when plan changes
  useEffect(() => {
    if (activePlanId && savedPlansData.size > 0) {
      const savedData = savedPlansData.get(activePlanId);
      
      if (savedData) {
        setInputs(savedData.inputs);
        setOneTimePayments(new Map(savedData.oneTimePayments));
        
        if (savedData.result) {
          setResult(savedData.result);
          setUpdatedSchedule(savedData.updatedSchedule || null);
        } else if (savedData.inputs) {
          const calculatedResult = generateAmortizationSchedule(savedData.inputs);
          setResult(calculatedResult);
          
          const monthlyRate = savedData.inputs.annualInterestRate / 100 / 12;
          
          if (savedData.oneTimePayments.size > 0) {
            const scheduleWithPayments = applyOneTimePaymentsToSchedule(
              calculatedResult.schedule,
              savedData.oneTimePayments,
              monthlyRate,
              calculatedResult.monthlyPayment,
              savedData.inputs.recurringExtraPayment || 0
            );
            setUpdatedSchedule(scheduleWithPayments);
          } else {
            setUpdatedSchedule(null);
          }
        }
      } else {
        setResult(null);
        setInputs(null);
        setUpdatedSchedule(null);
        setOneTimePayments(new Map());
      }
    } else if (!activePlanId) {
      setResult(null);
      setInputs(null);
      setUpdatedSchedule(null);
      setOneTimePayments(new Map());
    }
  }, [activePlanId, savedPlansData]);

  const monthlyInterestRate = inputs && inputs.annualInterestRate
    ? inputs.annualInterestRate / 100 / 12
    : 0;

  const recurringExtraPayment = inputs?.recurringExtraPayment || 0;

  const handleCalculate = (newInputs: MortgageInputs) => {
    setIsCalculating(true);
    setInputs(newInputs);

    setTimeout(() => {
      const calculatedResult = generateAmortizationSchedule(newInputs);
      setResult(calculatedResult);
      
      const monthlyRate = newInputs.annualInterestRate / 100 / 12;
      
      if (oneTimePayments.size > 0) {
        const scheduleWithPayments = applyOneTimePaymentsToSchedule(
          calculatedResult.schedule,
          oneTimePayments,
          monthlyRate,
          calculatedResult.monthlyPayment,
          newInputs.recurringExtraPayment || 0
        );
        setUpdatedSchedule(scheduleWithPayments);
      } else {
        setUpdatedSchedule(null);
      }
      
      setIsCalculating(false);
    }, 300);
  };

  const handleRecurringExtraChange = (newRecurringExtra: number) => {
    if (!result || !inputs) return;

    const newInputs: MortgageInputs = {
      ...inputs,
      recurringExtraPayment: newRecurringExtra || undefined,
    };

    const calculatedResult = generateAmortizationSchedule(newInputs);
    setResult(calculatedResult);
    setInputs(newInputs);

    const monthlyRate = inputs.annualInterestRate / 100 / 12;

    if (oneTimePayments.size > 0) {
      const scheduleWithPayments = applyOneTimePaymentsToSchedule(
        calculatedResult.schedule,
        oneTimePayments,
        monthlyRate,
        calculatedResult.monthlyPayment,
        newRecurringExtra
      );
      setUpdatedSchedule(scheduleWithPayments);
    } else {
      setUpdatedSchedule(null);
    }
  };

  const handleEditLoan = (id: string, name: string, createdAt: string) => {
    const updatedPlans = plans.map((plan) =>
      plan.id === id ? { ...plan, name, createdAt } : plan
    );
    onPlansChange(updatedPlans);
    
    if (userEmail) {
      saveUserData(userEmail, updatedPlans, savedPlansData);
    }
    setEditingLoan(null);
  };

  // Auto-save inputs
  useEffect(() => {
    if (!activePlanId || !userEmail || !inputs) return;
    
    const existingData = savedPlansData.get(activePlanId);
    const inputsChanged = !existingData || 
      JSON.stringify(existingData.inputs) !== JSON.stringify(inputs);
    
    if (!inputsChanged) return;
    
    const timeoutId = setTimeout(() => {
      const existingData = savedPlansData.get(activePlanId);
      const preservedPaidMonths = existingData?.paidMonths ?? 0;
      const planData: SavedPlanData = {
        inputs,
        result: result || existingData?.result,
        updatedSchedule: updatedSchedule || existingData?.updatedSchedule,
        oneTimePayments: oneTimePayments.size > 0 ? new Map(oneTimePayments) : (existingData?.oneTimePayments || new Map()),
        paidMonths: preservedPaidMonths,
      };
      
      const newSavedPlansData = new Map(savedPlansData);
      newSavedPlansData.set(activePlanId, planData);
      setSavedPlansData(newSavedPlansData);
      
      saveUserData(userEmail, plans, newSavedPlansData);
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [inputs, activePlanId, userEmail, result, updatedSchedule, oneTimePayments, savedPlansData, plans]);

  // Auto-save result
  useEffect(() => {
    if (!activePlanId || !userEmail || !result || !inputs) return;
    
    const existingData = savedPlansData.get(activePlanId);
    const resultChanged = !existingData?.result || 
      JSON.stringify(existingData.result) !== JSON.stringify(result);
    
    if (!resultChanged && !updatedSchedule && oneTimePayments.size === 0) return;
    
    const timeoutId = setTimeout(() => {
      const existingData = savedPlansData.get(activePlanId);
      const preservedPaidMonths = existingData?.paidMonths ?? 0;
      const planData: SavedPlanData = {
        inputs,
        result,
        updatedSchedule: updatedSchedule || undefined,
        oneTimePayments: new Map(oneTimePayments),
        paidMonths: preservedPaidMonths,
      };
      
      const newSavedPlansData = new Map(savedPlansData);
      newSavedPlansData.set(activePlanId, planData);
      setSavedPlansData(newSavedPlansData);
      
      saveUserData(userEmail, plans, newSavedPlansData);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [result, updatedSchedule, oneTimePayments, activePlanId, userEmail, inputs, savedPlansData, plans]);

  const handleSave = async () => {
    if (!activePlanId || !inputs) return;
    
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const existingData = savedPlansData.get(activePlanId);
    const preservedPaidMonths = existingData?.paidMonths ?? 0;
    const planData: SavedPlanData = {
      inputs,
      result: result || undefined,
      updatedSchedule: updatedSchedule || undefined,
      oneTimePayments: new Map(oneTimePayments),
      paidMonths: preservedPaidMonths,
    };
    
    const newSavedPlansData = new Map(savedPlansData);
    newSavedPlansData.set(activePlanId, planData);
    setSavedPlansData(newSavedPlansData);
    
    if (userEmail) {
      saveUserData(userEmail, plans, newSavedPlansData);
    }
    
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!activePlanId) return;
    
    if (!confirm(`Are you sure you want to delete "${activePlan?.name}"? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const remainingPlans = plans.filter(p => p.id !== activePlanId);
    onPlansChange(remainingPlans);
    
    const newSavedPlansData = new Map(savedPlansData);
    newSavedPlansData.delete(activePlanId);
    setSavedPlansData(newSavedPlansData);
    
    if (userEmail) {
      saveUserData(userEmail, remainingPlans, newSavedPlansData);
    }
    
    setIsDeleting(false);
  };

  return (
    <div className="min-h-full bg-white dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      {plans.length === 0 ? (
        <EmptyLoanState onCreateFirst={onAddNewPlan} />
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2"
          >
            <div className="text-center sm:text-left space-y-2 flex-1">
              <div className="flex items-center gap-3 pl-16 lg:pl-0 min-h-[3.5rem] sm:min-h-[4rem] lg:min-h-[4.5rem]">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {activePlan?.name || "Loan Calculator"}
                </h1>
                {activePlan && (
                  <button
                    onClick={() => setEditingLoan(activePlan)}
                    className="flex-shrink-0 p-2 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors group"
                    aria-label="Edit loan plan"
                  >
                    <Settings2 className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors" />
                  </button>
                )}
              </div>
              <p className="text-base lg:text-lg text-slate-600 dark:text-slate-400 pl-16 lg:pl-0">
                Calculate your payments with precision and explore different payment scenarios
              </p>
            </div>
            
            {activePlanId && (
              <div className="flex items-center gap-3 justify-center sm:justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !inputs}
                  className="h-11 px-6 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200"
                  aria-label="Save loan plan"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  variant="destructive"
                  className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg shadow-red-500/20 hover:shadow-xl transition-all duration-200"
                  aria-label="Delete loan plan"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            )}
          </motion.div>

          <InputSection 
            onCalculate={handleCalculate} 
            isCalculating={isCalculating}
            onRecurringExtraChange={handleRecurringExtraChange}
            hasResult={!!result}
            initialValues={inputs}
            onInputChange={(newInputs) => {
              setInputs(newInputs);
            }}
          />

          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <SummaryCard 
                result={result} 
                updatedSchedule={updatedSchedule || undefined}
                loanAmount={inputs?.principal}
                paidMonths={paidMonths}
                onPaidMonthsChange={(months) => {
                  if (activePlanId) {
                    const newSavedPlansData = new Map(savedPlansData);
                    const currentData = newSavedPlansData.get(activePlanId) || {
                      inputs: inputs!,
                      result,
                      updatedSchedule: updatedSchedule || undefined,
                      oneTimePayments,
                      paidMonths: 0,
                    };
                    const updatedData = {
                      ...currentData,
                      paidMonths: months,
                    };
                    newSavedPlansData.set(activePlanId, updatedData);
                    setSavedPlansData(newSavedPlansData);
                    
                    if (userEmail) {
                      saveUserData(userEmail, plans, newSavedPlansData);
                    }
                  }
                }}
              />

              <AmortizationTable
                result={result}
                monthlyInterestRate={monthlyInterestRate}
                recurringExtraPayment={recurringExtraPayment}
                onScheduleChange={(schedule) => setUpdatedSchedule(schedule)}
                oneTimePayments={oneTimePayments}
                onOneTimePaymentsChange={setOneTimePayments}
                onRecurringExtraChange={handleRecurringExtraChange}
                paidMonths={paidMonths}
              />
            </motion.div>
          )}
        </div>
      )}
      
      {editingLoan && (
        <EditLoanDialog
          loan={editingLoan}
          onSave={handleEditLoan}
          onClose={() => setEditingLoan(null)}
        />
      )}
    </div>
  );
}

