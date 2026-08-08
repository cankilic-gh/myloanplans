/**
 * Lease vs. Finance planning math.
 *
 * Pure, framework-free calculations for comparing "finance one car and hold it
 * to a horizon" against "keep leasing comparable new cars back-to-back until
 * the horizon." Every number here is a planning estimate driven entirely by
 * user-entered inputs — nothing is fetched live and nothing represents an
 * actual quote from any manufacturer or lender.
 */

export const DEPRECIATION_CURVE_YEARS = 10;

// ─── Depreciation curve ──────────────────────────────────────────────────────
// CarEdge's published Tesla Model 3 retained-value table (% of original MSRP
// still worth at the end of each ownership year). CarEdge's baseline for this
// curve assumes a $51,380 new price and 13,500 miles/year — this planner
// applies the same percentages to whatever purchase price the user enters, so
// treat the resulting dollar figures as estimates, not quotes. Source: CarEdge
// Tesla Model 3 depreciation data, last reviewed Aug 2026.
export const TESLA_MODEL_3_DEPRECIATION_CURVE: number[] = [
  70.0, 55.8, 42.2, 40.7, 39.2, 37.7, 35.2, 33.7, 19.5, 18.0,
];

export const DEPRECIATION_SOURCE_LABEL =
  "CarEdge Tesla Model 3 depreciation data (baseline: $51,380 new, 13,500 mi/yr) — last reviewed Aug 2026";

// Conservative, editable retained-value curve for a Toyota RAV4. Unlike the
// Tesla curve above, this isn't sourced from a published third-party study —
// it's a deliberately conservative planning estimate, clearly labeled as such
// in the UI. Treat it the same way: a starting point to edit, not a quote.
export const TOYOTA_RAV4_DEPRECIATION_CURVE: number[] = [
  82.0, 75.0, 69.0, 64.0, 60.0, 56.0, 52.0, 48.0, 43.0, 38.0,
];

export const TOYOTA_RAV4_DEPRECIATION_SOURCE_LABEL =
  "Illustrative Toyota RAV4 retained-value curve (conservative planning estimate, not a published third-party study) — last reviewed Aug 2026";

/** Clamp/sanitize a retained-value curve to exactly 10 years, each 0–100%. */
export function sanitizeDepreciationCurve(curve: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < DEPRECIATION_CURVE_YEARS; i++) {
    const raw = curve[i];
    const n = Number.isFinite(raw) ? raw : (out[i - 1] ?? 100);
    out.push(Math.min(100, Math.max(0, n)));
  }
  return out;
}

/** Retained-value percentage (0–100) at the end of a given ownership year. */
export function retainedValuePct(curve: number[], year: number): number {
  const clamped = sanitizeDepreciationCurve(curve);
  if (year <= 0) return 100;
  const idx = Math.min(DEPRECIATION_CURVE_YEARS, Math.round(year)) - 1;
  return clamped[idx] ?? clamped[clamped.length - 1] ?? 0;
}

// ─── Input types ──────────────────────────────────────────────────────────────

export type DepreciationMode = "tesla" | "rav4" | "custom";

/** Human-readable provenance for the active retained-value curve. */
export function getDepreciationSourceLabel(mode: DepreciationMode): string {
  switch (mode) {
    case "tesla":
      return DEPRECIATION_SOURCE_LABEL;
    case "rav4":
      return TOYOTA_RAV4_DEPRECIATION_SOURCE_LABEL;
    default:
      return "Custom retained-value curve — percentages you entered yourself.";
  }
}

export interface AutoCommonInputs {
  vehicleName: string;
  purchasePrice: number;
  /** Ownership/use horizon in whole years, 1–10. */
  horizonYears: number;
  annualMiles: number;
  /** Sales tax rate (%) — applied to the purchase price (finance) and to each monthly lease payment (lease). */
  salesTaxPct: number;
  /** One-time registration/doc fees, paid in cash at purchase (finance scenario only). */
  regDocFees: number;
  /** Annual insurance cost difference, lease minus finance ($/yr). Positive = lease costs more to insure. */
  annualInsuranceDeltaLeaseMinusFinance: number;
}

export interface AutoFinanceInputs {
  downPayment: number;
  /** Annual percentage rate, %. */
  apr: number;
  /** Loan term in months, 24–84. */
  termMonths: number;
  /** One-time loan origination/finance fees, paid in cash at purchase. */
  financeFees: number;
  /** Estimated annual maintenance & repair cost while owning the financed car. */
  annualMaintenance: number;
}

export interface AutoLeaseInputs {
  monthlyPayment: number;
  /** Lease term in months per cycle, 24–48. */
  leaseTermMonths: number;
  /**
   * Total drive-off amount due at signing, per cycle before escalation — cap cost
   * reduction + first month's payment + any taxes/fees you were quoted, exactly as
   * a dealer would state it. Enter this WITHOUT the acquisition fee below (that's
   * added separately). Because the first month's payment is bundled in here, the
   * monthly-payment cost for a cycle only counts months 2 through the end of term.
   */
  dueAtSigning: number;
  acquisitionFee: number;
  dispositionFee: number;
  includedMilesPerYear: number;
  excessMileRate: number;
  /** Estimated annual maintenance cost while leasing (typically lower — under warranty). */
  annualMaintenance: number;
  /** % increase applied to monthly payment / due-at-signing / fees for each replacement lease cycle. */
  cycleEscalationPct: number;
}

export interface AutoInputs {
  common: AutoCommonInputs;
  finance: AutoFinanceInputs;
  lease: AutoLeaseInputs;
  depreciationMode: DepreciationMode;
  depreciationCurve: number[];
}

// ─── Presets ──────────────────────────────────────────────────────────────────

// Illustrative Tesla Model 3 example. All figures are editable planning
// assumptions, not a live quote — see Methodology section in the UI.
// Finance terms and lease terms are researched, reasonable market examples;
// tax/fee/maintenance figures are generic placeholders clearly marked editable.
export const TESLA_EXAMPLE_INPUTS: AutoInputs = {
  common: {
    vehicleName: "Tesla Model 3",
    purchasePrice: 42490,
    horizonYears: 5,
    annualMiles: 10000,
    salesTaxPct: 7,
    regDocFees: 500,
    annualInsuranceDeltaLeaseMinusFinance: 0,
  },
  finance: {
    downPayment: 4000,
    apr: 5.49,
    termMonths: 60,
    financeFees: 150,
    annualMaintenance: 600,
  },
  lease: {
    monthlyPayment: 299,
    leaseTermMonths: 36,
    dueAtSigning: 2999,
    acquisitionFee: 0,
    dispositionFee: 395,
    includedMilesPerYear: 10000,
    excessMileRate: 0.25,
    annualMaintenance: 200,
    cycleEscalationPct: 3,
  },
  depreciationMode: "tesla",
  depreciationCurve: TESLA_MODEL_3_DEPRECIATION_CURVE,
};

// Illustrative Toyota RAV4 example, paired with the Tesla Model 3 example
// above so the example-vehicle picker always offers an EV and a gas/hybrid
// comparison. All figures are editable planning assumptions, not a live
// quote — see Methodology section in the UI. Last reviewed Aug 2026.
export const TOYOTA_RAV4_EXAMPLE_INPUTS: AutoInputs = {
  common: {
    vehicleName: "Toyota RAV4",
    purchasePrice: 31900,
    horizonYears: 5,
    annualMiles: 10000,
    salesTaxPct: 7,
    regDocFees: 500,
    annualInsuranceDeltaLeaseMinusFinance: 0,
  },
  finance: {
    downPayment: 3000,
    apr: 4.99,
    termMonths: 60,
    financeFees: 150,
    annualMaintenance: 650,
  },
  lease: {
    monthlyPayment: 349,
    leaseTermMonths: 36,
    dueAtSigning: 3999,
    acquisitionFee: 0,
    dispositionFee: 350,
    includedMilesPerYear: 10000,
    excessMileRate: 0.2,
    annualMaintenance: 250,
    cycleEscalationPct: 3,
  },
  depreciationMode: "rav4",
  depreciationCurve: TOYOTA_RAV4_DEPRECIATION_CURVE,
};

// A more neutral, generic starting point for planning a different vehicle.
export const GENERIC_DEFAULT_INPUTS: AutoInputs = {
  common: {
    vehicleName: "My Car",
    purchasePrice: 35000,
    horizonYears: 5,
    annualMiles: 12000,
    salesTaxPct: 7,
    regDocFees: 500,
    annualInsuranceDeltaLeaseMinusFinance: 0,
  },
  finance: {
    downPayment: 3000,
    apr: 6.5,
    termMonths: 60,
    financeFees: 150,
    annualMaintenance: 700,
  },
  lease: {
    monthlyPayment: 350,
    leaseTermMonths: 36,
    dueAtSigning: 2500,
    acquisitionFee: 595,
    dispositionFee: 350,
    includedMilesPerYear: 12000,
    excessMileRate: 0.2,
    annualMaintenance: 250,
    cycleEscalationPct: 3,
  },
  depreciationMode: "tesla",
  depreciationCurve: TESLA_MODEL_3_DEPRECIATION_CURVE,
};

// ─── Example-vehicle picker ───────────────────────────────────────────────────
// Curated, hand-edited illustrative snapshots — never fetched at runtime. The
// picker cycles/shuffles across this fixed list; add more entries here to
// extend it, no other wiring required.

export interface VehiclePreset {
  id: string;
  vehicleName: string;
  tagline: string;
  inputs: AutoInputs;
}

export const VEHICLE_PRESETS: VehiclePreset[] = [
  {
    id: "tesla-model-3",
    vehicleName: "Tesla Model 3",
    tagline: "EV sedan · illustrative snapshot",
    inputs: TESLA_EXAMPLE_INPUTS,
  },
  {
    id: "toyota-rav4",
    vehicleName: "Toyota RAV4",
    tagline: "Compact SUV · illustrative snapshot",
    inputs: TOYOTA_RAV4_EXAMPLE_INPUTS,
  },
];

export const DEFAULT_VEHICLE_PRESET_ID = VEHICLE_PRESETS[0].id;

// ─── Sanitization / clamping ──────────────────────────────────────────────────

export const HORIZON_MIN_YEARS = 1;
export const HORIZON_MAX_YEARS = 10;
export const FINANCE_TERM_MIN_MONTHS = 24;
export const FINANCE_TERM_MAX_MONTHS = 84;
export const LEASE_TERM_MIN_MONTHS = 24;
export const LEASE_TERM_MAX_MONTHS = 48;

const nonNeg = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));

export function clampHorizonYears(years: number): number {
  return Math.round(clamp(years, HORIZON_MIN_YEARS, HORIZON_MAX_YEARS));
}

export function clampFinanceTermMonths(months: number): number {
  return Math.round(clamp(months, FINANCE_TERM_MIN_MONTHS, FINANCE_TERM_MAX_MONTHS));
}

export function clampLeaseTermMonths(months: number): number {
  return Math.round(clamp(months, LEASE_TERM_MIN_MONTHS, LEASE_TERM_MAX_MONTHS));
}

// ─── Finance scenario ─────────────────────────────────────────────────────────

export interface FinanceYearResult {
  year: number;
  horizonMonths: number;
  amountFinanced: number;
  monthlyPayment: number;
  monthsPaid: number;
  loanPaidOff: boolean;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  remainingBalance: number;
  upfrontCash: number;
  maintenanceCost: number;
  cashPaidThroughHorizon: number;
  resaleValue: number;
  equity: number;
  netCost: number;
  effectiveMonthlyCost: number;
}

/** Standard fixed-rate amortized monthly payment. */
export function amortizedMonthlyPayment(
  principal: number,
  annualRatePct: number,
  termMonths: number
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const i = annualRatePct / 100 / 12;
  if (i === 0) return principal / termMonths;
  const factor = Math.pow(1 + i, termMonths);
  return (principal * (i * factor)) / (factor - 1);
}

export function computeFinanceScenario(
  common: AutoCommonInputs,
  finance: AutoFinanceInputs,
  depreciationCurve: number[],
  year: number
): FinanceYearResult {
  const horizonMonths = Math.max(0, Math.round(year * 12));
  const termMonths = clampFinanceTermMonths(finance.termMonths);
  const downPayment = nonNeg(finance.downPayment);
  const amountFinanced = Math.max(0, nonNeg(common.purchasePrice) - downPayment);
  const monthlyPayment = amortizedMonthlyPayment(amountFinanced, finance.apr, termMonths);
  const monthlyRate = finance.apr / 100 / 12;

  const monthsPaid = Math.min(horizonMonths, termMonths);
  let balance = amountFinanced;
  let totalInterestPaid = 0;
  for (let m = 1; m <= monthsPaid; m++) {
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(monthlyPayment - interest, balance);
    balance = Math.max(0, balance - principalPaid);
    totalInterestPaid += interest;
  }
  // Guard against floating point residue once the loan is fully amortized.
  const loanPaidOff = monthsPaid >= termMonths;
  const remainingBalance = loanPaidOff ? 0 : Math.round(balance * 100) / 100;
  const totalPrincipalPaid = round2(amountFinanced - remainingBalance);

  const salesTax = nonNeg(common.purchasePrice) * (nonNeg(common.salesTaxPct) / 100);
  const upfrontCash = downPayment + salesTax + nonNeg(common.regDocFees) + nonNeg(finance.financeFees);
  const maintenanceCost = nonNeg(finance.annualMaintenance) * year;
  const cashPaidThroughHorizon = round2(upfrontCash + monthsPaid * monthlyPayment + maintenanceCost);

  const resaleValue = round2(nonNeg(common.purchasePrice) * (retainedValuePct(depreciationCurve, year) / 100));
  const equity = round2(resaleValue - remainingBalance);
  const netCost = round2(cashPaidThroughHorizon - equity);
  const effectiveMonthlyCost = horizonMonths > 0 ? round2(netCost / horizonMonths) : 0;

  return {
    year,
    horizonMonths,
    amountFinanced: round2(amountFinanced),
    monthlyPayment: round2(monthlyPayment),
    monthsPaid,
    loanPaidOff,
    totalInterestPaid: round2(totalInterestPaid),
    totalPrincipalPaid,
    remainingBalance,
    upfrontCash: round2(upfrontCash),
    maintenanceCost: round2(maintenanceCost),
    cashPaidThroughHorizon,
    resaleValue,
    equity,
    netCost,
    effectiveMonthlyCost,
  };
}

// ─── Lease scenario ───────────────────────────────────────────────────────────

export interface LeaseCycleBreakdown {
  cycle: number; // 1-indexed
  startMonth: number;
  endMonth: number;
  monthsInCycle: number;
  isPartial: boolean;
  monthlyPayment: number;
  dueAtSigning: number;
  acquisitionFee: number;
  dispositionFee: number;
  taxOnPayments: number;
  maintenanceCost: number;
  insuranceDelta: number;
  estimatedExcessMiles: number;
  excessMileageCharge: number;
  cycleCost: number;
}

export interface LeaseYearResult {
  year: number;
  horizonMonths: number;
  cycles: LeaseCycleBreakdown[];
  cyclesCompleted: number;
  cyclesStarted: number;
  totalCost: number;
  netCost: number;
  effectiveMonthlyCost: number;
}

export function computeLeaseScenario(
  common: AutoCommonInputs,
  lease: AutoLeaseInputs,
  year: number
): LeaseYearResult {
  const horizonMonths = Math.max(0, Math.round(year * 12));
  const termMonths = clampLeaseTermMonths(lease.leaseTermMonths);
  const escalation = 1 + nonNeg(lease.cycleEscalationPct) / 100;
  const taxRate = nonNeg(common.salesTaxPct) / 100;
  const monthlyMiles = nonNeg(common.annualMiles) / 12;
  const includedMonthlyMiles = nonNeg(lease.includedMilesPerYear) / 12;

  const cycles: LeaseCycleBreakdown[] = [];
  let cycleIndex = 0;
  while (cycleIndex * termMonths < horizonMonths) {
    const startMonth = cycleIndex * termMonths;
    const endMonth = Math.min(startMonth + termMonths, horizonMonths);
    const monthsInCycle = endMonth - startMonth;
    if (monthsInCycle <= 0) break;
    const isPartial = monthsInCycle < termMonths;

    const factor = Math.pow(escalation, cycleIndex);
    const monthlyPayment = round2(nonNeg(lease.monthlyPayment) * factor);
    const dueAtSigning = round2(nonNeg(lease.dueAtSigning) * factor);
    const acquisitionFee = round2(nonNeg(lease.acquisitionFee) * factor);
    const dispositionFee = round2(nonNeg(lease.dispositionFee) * factor);

    // dueAtSigning already bundles the first month's payment (and tax on it), so
    // the recurring monthly-payment line only bills months 2..monthsInCycle —
    // otherwise month 1 would be charged twice.
    const separatelyBilledMonths = Math.max(0, monthsInCycle - 1);
    const taxOnPayments = round2(monthlyPayment * taxRate * separatelyBilledMonths);
    const maintenanceCost = round2(nonNeg(lease.annualMaintenance) * (monthsInCycle / 12));
    const insuranceDelta = round2(common.annualInsuranceDeltaLeaseMinusFinance * (monthsInCycle / 12));

    // Only a lease cycle that actually completes within the horizon is
    // turned in — that's when disposition fees and excess-mileage charges
    // apply. A partial final cycle means the lease is still active at the
    // horizon: you've paid the due-at-signing, acquisition fee, and the
    // months driven so far, but haven't turned the car in yet, so no
    // disposition fee or mileage settlement is charged for it.
    const estimatedExcessMiles = isPartial
      ? 0
      : Math.max(0, (monthlyMiles - includedMonthlyMiles) * monthsInCycle);
    const excessMileageCharge = round2(estimatedExcessMiles * nonNeg(lease.excessMileRate));
    const effectiveDispositionFee = isPartial ? 0 : dispositionFee;

    const cycleCost = round2(
      dueAtSigning +
        acquisitionFee +
        monthlyPayment * separatelyBilledMonths +
        taxOnPayments +
        maintenanceCost +
        insuranceDelta +
        effectiveDispositionFee +
        excessMileageCharge
    );

    cycles.push({
      cycle: cycleIndex + 1,
      startMonth,
      endMonth,
      monthsInCycle,
      isPartial,
      monthlyPayment,
      dueAtSigning,
      acquisitionFee,
      dispositionFee: effectiveDispositionFee,
      taxOnPayments,
      maintenanceCost,
      insuranceDelta,
      estimatedExcessMiles: Math.round(estimatedExcessMiles),
      excessMileageCharge,
      cycleCost,
    });

    cycleIndex++;
  }

  const totalCost = round2(cycles.reduce((s, c) => s + c.cycleCost, 0));
  const cyclesCompleted = cycles.filter((c) => !c.isPartial).length;

  return {
    year,
    horizonMonths,
    cycles,
    cyclesCompleted,
    cyclesStarted: cycles.length,
    totalCost,
    netCost: totalCost,
    effectiveMonthlyCost: horizonMonths > 0 ? round2(totalCost / horizonMonths) : 0,
  };
}

// ─── Comparison ───────────────────────────────────────────────────────────────

export type Recommendation = "finance" | "lease" | "tie";

export interface ComparisonResult {
  year: number;
  finance: FinanceYearResult;
  lease: LeaseYearResult;
  recommendation: Recommendation;
  dollarDifference: number;
}

export function computeComparison(inputs: AutoInputs, year: number): ComparisonResult {
  const finance = computeFinanceScenario(inputs.common, inputs.finance, inputs.depreciationCurve, year);
  const lease = computeLeaseScenario(inputs.common, inputs.lease, year);
  const diff = round2(finance.netCost - lease.netCost);
  const recommendation: Recommendation =
    Math.abs(diff) < 0.5 ? "tie" : diff < 0 ? "finance" : "lease";
  return {
    year,
    finance,
    lease,
    recommendation,
    dollarDifference: Math.abs(diff),
  };
}

/** Comparison at the user's chosen horizon. */
export function computeAtHorizon(inputs: AutoInputs): ComparisonResult {
  return computeComparison(inputs, clampHorizonYears(inputs.common.horizonYears));
}

/** Year-by-year series (1..maxYears) for charts and the scenario table. */
export function buildYearSeries(inputs: AutoInputs, maxYears = HORIZON_MAX_YEARS): ComparisonResult[] {
  const out: ComparisonResult[] = [];
  for (let y = 1; y <= maxYears; y++) {
    out.push(computeComparison(inputs, y));
  }
  return out;
}

/**
 * First year (1..maxYears) at which the cheaper option flips relative to
 * year 1, or null if the same option stays cheaper across the whole range.
 */
export function findBreakEvenYear(inputs: AutoInputs, maxYears = HORIZON_MAX_YEARS): number | null {
  const series = buildYearSeries(inputs, maxYears);
  if (series.length === 0) return null;
  const firstDiff = series[0].finance.netCost - series[0].lease.netCost;
  if (Math.abs(firstDiff) < 0.5) return series[0].year;
  const firstSign = Math.sign(firstDiff);
  for (let i = 1; i < series.length; i++) {
    const diff = series[i].finance.netCost - series[i].lease.netCost;
    if (Math.sign(diff) !== firstSign) return series[i].year;
  }
  return null;
}

function round2(n: number): number {
  return Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
}
