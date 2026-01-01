"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { MortgageInputs } from "@/utils/mortgageMath";
import { motion } from "framer-motion";

interface InputSectionProps {
  onCalculate: (inputs: MortgageInputs) => void;
  isCalculating: boolean;
  onRecurringExtraChange?: (value: number) => void;
  hasResult?: boolean;
  initialValues?: MortgageInputs | null;
  onInputChange?: (inputs: MortgageInputs) => void; // Callback when inputs change (without calculating)
}

export function InputSection({ 
  onCalculate, 
  isCalculating,
  onRecurringExtraChange,
  hasResult = false,
  initialValues = null,
  onInputChange,
}: InputSectionProps) {
  const [principal, setPrincipal] = useState<string>("");
  const [annualInterestRate, setAnnualInterestRate] = useState<string>("");
  const [loanTermMonths, setLoanTermMonths] = useState<string>("");
  const [downPayment, setDownPayment] = useState<string>("");
  const [recurringExtraPayment, setRecurringExtraPayment] = useState<string>("");

  // Update form values when initialValues change (plan switch)
  useEffect(() => {
    if (initialValues) {
      setPrincipal(initialValues.principal.toString());
      setAnnualInterestRate(initialValues.annualInterestRate.toString());
      setLoanTermMonths(initialValues.loanTermMonths.toString());
      setDownPayment(initialValues.downPayment?.toString() || "");
      setRecurringExtraPayment(initialValues.recurringExtraPayment?.toString() || "");
    } else {
      // Clear form when no initial values
      setPrincipal("");
      setAnnualInterestRate("");
      setLoanTermMonths("");
      setDownPayment("");
      setRecurringExtraPayment("");
    }
  }, [initialValues]);

  // Helper to create inputs object
  const createInputsObject = (): MortgageInputs => {
    return {
      principal: parseFloat(principal) || 0,
      annualInterestRate: parseFloat(annualInterestRate) || 0,
      loanTermMonths: parseInt(loanTermMonths) || 0,
      downPayment: downPayment ? parseFloat(downPayment) : undefined,
      recurringExtraPayment: recurringExtraPayment
        ? parseFloat(recurringExtraPayment)
        : undefined,
    };
  };

  // Notify parent when inputs change (for auto-save)
  useEffect(() => {
    if (onInputChange && (principal || annualInterestRate || loanTermMonths)) {
      const inputs = createInputsObject();
      // Only notify if at least one field has a value
      if (inputs.principal > 0 || inputs.annualInterestRate > 0 || inputs.loanTermMonths > 0 || downPayment || recurringExtraPayment) {
        onInputChange(inputs);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [principal, annualInterestRate, loanTermMonths, downPayment, recurringExtraPayment]);

  const handleCalculate = () => {
    const inputs = createInputsObject();
    onCalculate(inputs);
  };

  const isFormValid = () => {
    const principalNum = parseFloat(principal);
    const rateNum = parseFloat(annualInterestRate);
    const termNum = parseInt(loanTermMonths);

    return (
      principalNum > 0 &&
      rateNum >= 0 &&
      rateNum <= 100 &&
      termNum > 0 &&
      termNum <= 600 &&
      (!downPayment || parseFloat(downPayment) >= 0) &&
      (!recurringExtraPayment || parseFloat(recurringExtraPayment) >= 0)
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Mortgage Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal">Principal Amount ($)</Label>
              <Input
                id="principal"
                type="number"
                placeholder="500,000"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                min="0"
                step="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                placeholder="6.5"
                value={annualInterestRate}
                onChange={(e) => setAnnualInterestRate(e.target.value)}
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanTerm">Loan Term (Months)</Label>
              <Input
                id="loanTerm"
                type="number"
                placeholder="360"
                value={loanTermMonths}
                onChange={(e) => setLoanTermMonths(e.target.value)}
                min="1"
                max="600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="downPayment">Down Payment ($) - Optional</Label>
              <Input
                id="downPayment"
                type="number"
                placeholder="100,000"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                min="0"
                step="1000"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="recurringExtra">
                Recurring Extra Payment ($/month) - Optional
              </Label>
              <Input
                id="recurringExtra"
                type="number"
                placeholder="200"
                value={recurringExtraPayment}
                onChange={(e) => {
                  setRecurringExtraPayment(e.target.value);
                  // If result exists, update dynamically
                  if (hasResult && onRecurringExtraChange) {
                    const value = parseFloat(e.target.value) || 0;
                    onRecurringExtraChange(value);
                  }
                }}
                min="0"
                step="10"
              />
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            disabled={!isFormValid() || isCalculating}
            className="w-full mt-6 h-12 text-base font-semibold"
            size="lg"
          >
            {isCalculating ? "Calculating..." : "Calculate Mortgage"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}





