"use client";

import { BookOpen } from "lucide-react";
import { DEPRECIATION_SOURCE_LABEL } from "@/lib/auto/autoMath";
import { SectionHeader } from "./fields";

export function Methodology() {
  return (
    <details className="card-premium overflow-hidden group">
      <summary className="cursor-pointer list-none px-5 sm:px-6 py-4 flex items-center justify-between gap-3 hover:bg-foreground/[0.02] transition-colors">
        <SectionHeader
          icon={<BookOpen className="w-4 h-4 text-brand" />}
          title="Methodology & Assumptions"
          subtitle="How every number on this page is calculated"
        />
        <span className="text-xs text-muted shrink-0 transition-transform group-open:rotate-180">▾</span>
      </summary>

      <div className="border-t border-border px-5 sm:px-6 py-5 space-y-5 text-sm text-muted leading-relaxed">
        <p>
          This is a planning tool, not financial advice, a loan offer, or a lease quote. Every figure —
          including the pre-filled Tesla Model 3 example — is an editable, illustrative assumption you
          control. Change any input and every result recalculates instantly and locally in your browser.
        </p>

        <div className="space-y-1.5">
          <p className="font-semibold text-foreground">Finance scenario</p>
          <p>
            The loan amount is your purchase price minus your down payment (sales tax, registration/doc
            fees, and finance fees are assumed paid in cash at signing, not rolled into the loan). Monthly
            payment uses the standard amortization formula M = P × [i(1+i)ⁿ] / [(1+i)ⁿ − 1], where P is the
            loan amount, i is APR ÷ 12, and n is the loan term in months. If your horizon extends past the
            loan term, payments stop at payoff and the loan balance is $0 for the remaining years — only
            maintenance and depreciation continue. Net cost = cash paid (down payment + tax/fees + payments
            made + maintenance) − equity (estimated resale value − any remaining loan balance).
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="font-semibold text-foreground">Lease scenario & repeated leases</p>
          <p>
            When your horizon is longer than one lease term, the model assumes you return the car and sign
            a comparable replacement lease, repeating until the horizon is reached (default strategy: return
            at term end, no buyout). Each new cycle&apos;s monthly payment, due-at-signing, acquisition fee,
            and disposition fee are increased by your replacement-lease escalation rate, compounding per
            cycle. The &quot;Due at Signing&quot; figure you enter is treated as a total drive-off amount that
            already bundles the first month&apos;s payment (plus any cap reduction/taxes/fees you were
            quoted) — so to avoid billing that first month twice, each cycle&apos;s recurring monthly-payment
            line only covers months 2 through the end of the term. If the horizon ends mid-cycle, that final
            lease is still &quot;in force&quot;: due-at-signing and the acquisition fee for that cycle are
            counted (you signed the commitment), monthly payments are counted only for the months actually
            elapsed, and the disposition fee and excess-mileage charge are{" "}
            <span className="font-medium text-foreground">not</span> counted, since the car hasn&apos;t been
            turned in within the horizon. Excess mileage per completed cycle is estimated as (your annual
            miles − included miles/year) × (lease term in years), charged at your excess-mile rate. Lease net
            cost has no offsetting resale value, since you never own the car.
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="font-semibold text-foreground">Taxes</p>
          <p>
            Sales tax is applied once, upfront, to the full purchase price in the finance scenario. In the
            lease scenario, the same rate is applied to each separately billed monthly payment — months 2
            through the end of each cycle, since month 1 is already bundled into due-at-signing (a common
            tax treatment on leases in many U.S. states). Due-at-signing and fee amounts you enter should be
            the actual totals you&apos;d pay, taxes included — the tool does not add tax on top of them.
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="font-semibold text-foreground">Depreciation & resale value</p>
          <p>
            Resale/trade-in value at your horizon is estimated as (retained-value % for that year) × (your
            purchase price). The default curve is {DEPRECIATION_SOURCE_LABEL}. CarEdge&apos;s published
            baseline for this curve assumes a $51,380 vehicle driven 13,500 mi/yr — this tool re-applies the
            same percentages to whatever price and mileage you enter, so treat resulting dollar figures as
            directional estimates, not appraisals. Switch to Custom mode to enter your own retained-value
            percentages for any or all of the 10 years.
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="font-semibold text-foreground">What&apos;s excluded</p>
          <p>
            Fuel or charging costs, tolls, parking, financing/lease approval qualification, trade-in
            timing effects, early-termination penalties, and buyout options at lease end are not modeled.
            Add an equivalent adjustment via the maintenance or insurance-difference fields if you want to
            approximate them.
          </p>
        </div>

        <p className="text-xs pt-1 border-t border-border">
          All inputs are saved only to this browser&apos;s local storage. Nothing is sent to a server. This
          tool does not connect to any live pricing, inventory, or lender API — every number is either an
          example you can edit or one you typed in yourself.
        </p>
      </div>
    </details>
  );
}
