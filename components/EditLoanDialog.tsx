"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save, Settings2 } from "lucide-react";
import { LoanPlan } from "@/components/DashboardLayout";

interface EditLoanDialogProps {
  loan: LoanPlan;
  onSave: (id: string, name: string, createdAt: string) => void;
  onClose: () => void;
}

export function EditLoanDialog({ loan, onSave, onClose }: EditLoanDialogProps) {
  const [name, setName] = useState(loan.name);
  const [createdAt, setCreatedAt] = useState(loan.createdAt);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    onSave(loan.id, name, createdAt);
    setIsSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
                <Settings2 className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Edit Loan Plan</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-500 dark:text-slate-300" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Loan Name */}
            <div>
              <Label htmlFor="loanName" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Loan Name
              </Label>
              <Input
                id="loanName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Home Mortgage"
                className="mt-1.5"
              />
            </div>

            {/* Start Date */}
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                This helps calculate your payment progress
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90"
              disabled={isSaving || !name.trim()}
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}



