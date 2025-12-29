"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  MortgageResult,
  PaymentScheduleRow,
  formatCurrency,
  recalculateScheduleFromMonth,
} from "@/utils/mortgageMath";
import { motion, AnimatePresence } from "framer-motion";
import { Table, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface AmortizationTableProps {
  result: MortgageResult;
  monthlyInterestRate: number;
  recurringExtraPayment: number;
  onScheduleChange?: (updatedSchedule: PaymentScheduleRow[]) => void;
  oneTimePayments?: Map<number, number>;
  onOneTimePaymentsChange?: (payments: Map<number, number>) => void;
  onRecurringExtraChange?: (newValue: number) => void;
  paidMonths?: number;
}

export function AmortizationTable({
  result,
  monthlyInterestRate,
  recurringExtraPayment,
  onScheduleChange,
  oneTimePayments: externalOneTimePayments,
  onOneTimePaymentsChange,
  onRecurringExtraChange,
  paidMonths = 0,
}: AmortizationTableProps) {
  const [schedule, setSchedule] = useState<PaymentScheduleRow[]>(
    result.schedule
  );
  const [internalOneTimePayments, setInternalOneTimePayments] = useState<
    Map<number, number>
  >(new Map());
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use external one-time payments if provided, otherwise use internal state
  const oneTimePayments = externalOneTimePayments ?? internalOneTimePayments;
  const setOneTimePayments = onOneTimePaymentsChange ?? setInternalOneTimePayments;

  // Auto-scroll to paid month row (only within the table container, not the page)
  useEffect(() => {
    if (paidMonths > 0 && tableBodyRef.current && scrollContainerRef.current) {
      const targetRow = tableBodyRef.current.querySelector(
        `[data-month="${paidMonths}"]`
      ) as HTMLElement;
      if (targetRow && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const rowRect = targetRow.getBoundingClientRect();
        
        // Calculate scroll position to center the row within the container
        const scrollTop = container.scrollTop;
        const rowOffset = targetRow.offsetTop;
        const containerHeight = container.clientHeight;
        const rowHeight = rowRect.height;
        
        // Center the row in the container
        const targetScrollTop = rowOffset - (containerHeight / 2) + (rowHeight / 2);
        
        container.scrollTo({
          top: targetScrollTop,
          behavior: "smooth",
        });
        
        setHighlightedRow(paidMonths);
        // Clear highlight after 2 seconds
        const timer = setTimeout(() => setHighlightedRow(null), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [paidMonths]);

  useEffect(() => {
    // Apply existing one-time payments to new result schedule
    if (oneTimePayments.size > 0) {
      let currentSchedule = [...result.schedule];
      const sortedPayments = Array.from(oneTimePayments.entries()).sort(
        (a, b) => a[0] - b[0]
      );

      for (const [paymentMonth, paymentValue] of sortedPayments) {
        currentSchedule = recalculateScheduleFromMonth(
          currentSchedule,
          paymentMonth,
          paymentValue,
          monthlyInterestRate,
          result.monthlyPayment,
          recurringExtraPayment
        );
      }
      setSchedule(currentSchedule);
      onScheduleChange?.(currentSchedule);
    } else {
      setSchedule(result.schedule);
      onScheduleChange?.(result.schedule);
    }
  }, [result, monthlyInterestRate, recurringExtraPayment, oneTimePayments, onScheduleChange]);

  const handleOneTimePayment = (
    month: number,
    value: string,
    baseSchedule: PaymentScheduleRow[]
  ) => {
    const paymentAmount = parseFloat(value) || 0;

    if (paymentAmount < 0) return;

    const newOneTimePayments = new Map(oneTimePayments);
    if (paymentAmount > 0) {
      newOneTimePayments.set(month, paymentAmount);
    } else {
      newOneTimePayments.delete(month);
    }
    setOneTimePayments(new Map(newOneTimePayments));

    // Recalculate entire schedule with all one-time payments
    if (newOneTimePayments.size > 0) {
      let currentSchedule = [...baseSchedule];
      
      // Sort months and apply payments in order
      const sortedPayments = Array.from(newOneTimePayments.entries()).sort(
        (a, b) => a[0] - b[0]
      );

      for (const [paymentMonth, paymentValue] of sortedPayments) {
        currentSchedule = recalculateScheduleFromMonth(
          currentSchedule,
          paymentMonth,
          paymentValue,
          monthlyInterestRate,
          result.monthlyPayment,
          recurringExtraPayment
        );
      }
      
      setSchedule(currentSchedule);
      // Notify parent component about schedule change
      onScheduleChange?.(currentSchedule);
    } else {
      // Reset to base schedule if all payments are removed
      setSchedule(baseSchedule);
      onScheduleChange?.(baseSchedule);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5 text-primary" />
            Amortization Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden border rounded-lg">
                <div ref={scrollContainerRef} className="max-h-[500px] overflow-y-auto scroll-smooth">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider bg-slate-50">
                          Month
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider bg-slate-50">
                          Payment
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider bg-slate-50">
                          Principal
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider bg-slate-50">
                          Interest
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider bg-slate-50">
                          Extra Payment
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider bg-slate-50">
                          Remaining Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody ref={tableBodyRef} className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {schedule.map((row, index) => {
                        const isPaid = index < paidMonths;
                        const isHighlighted = highlightedRow === row.month;
                        return (
                        <motion.tr
                          key={row.month}
                          data-month={row.month}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{
                            duration: 0.2,
                            delay: index * 0.01,
                          }}
                          className={cn(
                            "hover:bg-slate-50 transition-all duration-300",
                            isPaid && "bg-emerald-50/50",
                            isHighlighted && "ring-2 ring-emerald-500 ring-inset shadow-lg"
                          )}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                            {row.month}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                            {formatCurrency(row.paymentAmount)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-600 font-medium">
                            {formatCurrency(row.principalPayment)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-rose-600">
                            {formatCurrency(row.interestPayment)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Input
                              type="number"
                              placeholder="0"
                              min="0"
                              step="100"
                              value={
                                oneTimePayments.get(row.month)?.toString() ||
                                row.oneTimeExtraPayment?.toString() ||
                                ""
                              }
                              onChange={(e) =>
                                handleOneTimePayment(
                                  row.month,
                                  e.target.value,
                                  result.schedule
                                )
                              }
                              className="w-24 h-8 text-xs"
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-900">
                            {formatCurrency(row.remainingBalance)}
                          </td>
                        </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          </div>

          {schedule.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No payment schedule available. Please calculate first.
            </div>
          )}

          <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-sm text-indigo-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>
                <strong>Tip:</strong> Use the "Months Paid" selector to see your payoff amount at any point. 
                Enter one-time extra payments to reduce your balance faster.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

