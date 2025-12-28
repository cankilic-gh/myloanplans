"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Target, Plus } from "lucide-react";

interface EmptyLoanStateProps {
  onCreateFirst: () => void;
}

export function EmptyLoanState({ onCreateFirst }: EmptyLoanStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6 relative"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-emerald-500/20 rounded-full blur-2xl scale-150" />
        
        {/* Icon Container */}
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-xl">
          <Target className="h-12 w-12 text-white" />
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 text-center"
      >
        No Loan Plans Yet
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-base text-slate-600 mb-8 text-center max-w-md"
      >
        Let's get you on the path to financial freedom. Create your first loan
        plan and see exactly when you'll be debt-free.
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Button
          onClick={onCreateFirst}
          size="lg"
          className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Your First Loan Plan
        </Button>
      </motion.div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500"
      >
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Free forever</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>Secure & private</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span>No credit check</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

