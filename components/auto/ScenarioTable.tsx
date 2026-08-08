"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import { computeComparison, type AutoInputs } from "@/lib/auto/autoMath";
import { formatCurrency } from "@/lib/format";

interface Props {
  inputs: AutoInputs;
}

const SCENARIO_YEARS = [3, 5, 10];

export function ScenarioTable({ inputs }: Props) {
  const rows = useMemo(
    () => SCENARIO_YEARS.map((y) => computeComparison(inputs, y)),
    [inputs]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="card-premium p-5 sm:p-6 space-y-4"
    >
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
          <LayoutGrid className="w-4 h-4 text-brand" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">3 / 5 / 10-Year Scenario Table</p>
          <p className="text-xs text-muted">
            Independent snapshots at each horizon — not affected by the slider above
          </p>
        </div>
      </div>

      <div className="overflow-x-auto scroll-thin">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Net cost comparison between financing and leasing at 3, 5, and 10 year horizons
          </caption>
          <thead>
            <tr className="border-b border-border text-left text-muted text-xs">
              <th scope="col" className="py-2 pr-4 font-medium">Horizon</th>
              <th scope="col" className="py-2 pr-4 font-medium">Finance Net Cost</th>
              <th scope="col" className="py-2 pr-4 font-medium">Lease Net Cost</th>
              <th scope="col" className="py-2 pr-4 font-medium">Cheaper Option</th>
              <th scope="col" className="py-2 font-medium">Difference</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.year} className="border-b border-border/60 last:border-0">
                <td className="py-2.5 pr-4 font-semibold text-foreground balance-num">{r.year} yr</td>
                <td className="py-2.5 pr-4 balance-num text-foreground">{formatCurrency(r.finance.netCost)}</td>
                <td className="py-2.5 pr-4 balance-num text-foreground">{formatCurrency(r.lease.netCost)}</td>
                <td className="py-2.5 pr-4">
                  <span
                    className={`inline-flex items-center h-5 px-2 rounded-md text-[11px] font-semibold border ${
                      r.recommendation === "finance"
                        ? "bg-brand/10 text-brand border-brand/20"
                        : r.recommendation === "lease"
                        ? "bg-lavender/10 text-lavender border-lavender/20"
                        : "bg-foreground/[0.05] text-muted border-border"
                    }`}
                  >
                    {r.recommendation === "tie" ? "Tie" : r.recommendation === "finance" ? "Finance" : "Lease"}
                  </span>
                </td>
                <td className="py-2.5 balance-num text-foreground">{formatCurrency(r.dollarDifference)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
