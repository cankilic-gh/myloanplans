"use client";

import { motion } from "framer-motion";
import { Landmark, KeySquare, Scale, GitBranch } from "lucide-react";
import type { ComparisonResult } from "@/lib/auto/autoMath";
import { formatCurrency } from "@/lib/format";

interface Props {
  result: ComparisonResult;
  breakEvenYear: number | null;
  vehicleName: string;
}

export function RecommendationCard({ result, breakEvenYear, vehicleName }: Props) {
  const { recommendation, dollarDifference, year } = result;

  const isTie = recommendation === "tie";
  const isFinance = recommendation === "finance";

  const label = isTie ? "Roughly a Wash" : isFinance ? "Financing looks cheaper" : "Leasing looks cheaper";
  const Icon = isTie ? Scale : isFinance ? Landmark : KeySquare;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="card-premium px-6 py-6 sm:py-7 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(47,107,255,0.09),rgba(139,123,255,0.06)_45%,rgba(43,212,164,0.03)_70%,transparent_90%)] pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-brand" />
          </span>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Over {year} {year === 1 ? "year" : "years"} with {vehicleName || "this vehicle"}
            </p>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {label}
            </p>
            <p className="text-sm text-muted max-w-md">
              {isTie ? (
                <>Under these assumptions, financing and leasing land within about {formatCurrency(dollarDifference)} of each other — close enough to call a tie.</>
              ) : (
                <>
                  Under these assumptions,{" "}
                  <span className="font-semibold text-foreground">
                    {isFinance ? "financing" : "leasing"}
                  </span>{" "}
                  costs about{" "}
                  <span className="font-semibold text-foreground balance-num">
                    {formatCurrency(dollarDifference)}
                  </span>{" "}
                  less than {isFinance ? "leasing" : "financing"} through year {year}.
                </>
              )}
            </p>
          </div>
        </div>

        {breakEvenYear && (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-muted shrink-0">
            <GitBranch className="w-3.5 h-3.5 text-brand" />
            <span>
              Cheaper option flips around{" "}
              <span className="font-semibold text-foreground">year {breakEvenYear}</span>
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
