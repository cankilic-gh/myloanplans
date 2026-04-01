import type { CsvFormat, ParsedTransaction, ParsedCsvResult, CategoryGroup } from "./types";

// --- CSV Text Parser ---

function parseCSVText(raw: string): string[][] {
  const lines = raw.trim().split(/\r?\n/);
  return lines.map((line) => {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (char === "," && !inQuotes) {
        fields.push(current.trim());
        current = "";
        continue;
      }
      current += char;
    }
    fields.push(current.trim());
    return fields;
  });
}

// --- Format Detection ---

export function detectFormat(headerRow: string[]): CsvFormat {
  const joined = headerRow.join(",").toLowerCase();
  if (joined.includes("balance") && joined.includes("check or slip")) {
    return "BANK";
  }
  if (joined.includes("category") && joined.includes("memo")) {
    return "CREDIT_CARD";
  }
  throw new Error("Unsupported CSV format. Only Chase Bank and Credit Card statements are supported.");
}

// --- Date Conversion ---

function convertDate(mmddyyyy: string): string {
  const parts = mmddyyyy.split("/");
  if (parts.length !== 3) return mmddyyyy;
  const [mm, dd, yyyy] = parts;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

// --- Bank CSV Category Mapping ---

const BANK_TYPE_CATEGORY: Record<string, { name: string; type: "INCOME" | "EXPENSE" }> = {
  ACH_CREDIT: { name: "Income", type: "INCOME" },
  ACH_DEBIT: { name: "Bills & Utilities", type: "EXPENSE" },
  QUICKPAY_CREDIT: { name: "Transfers In", type: "INCOME" },
  QUICKPAY_DEBIT: { name: "Transfers", type: "EXPENSE" },
  LOAN_PMT: { name: "Loan Payment", type: "EXPENSE" },
  MISC_DEBIT: { name: "Rent & Housing", type: "EXPENSE" },
  MISC_CREDIT: { name: "Transfers In", type: "INCOME" },
  ATM: { name: "Cash & ATM", type: "EXPENSE" },
  ACCT_XFER: { name: "Transfers", type: "EXPENSE" },
  CHASE_TO_PARTNERFI: { name: "Transfers", type: "EXPENSE" },
  CHECK_DEPOSIT: { name: "Income", type: "INCOME" },
};

const DESCRIPTION_KEYWORDS: Array<{ keywords: string[]; category: string }> = [
  { keywords: ["PAYROLL", "DIRECT DEP", "SALARY"], category: "Payroll" },
  { keywords: ["BILT", "BILTRENT"], category: "Rent & Housing" },
  { keywords: ["FPL", "ELECTRIC", "UTILITY"], category: "Bills & Utilities" },
  { keywords: ["FLORIDA PREPAID"], category: "Education" },
  { keywords: ["LENDINGCLUB"], category: "Loan Payment" },
  { keywords: ["IRS", "TAX"], category: "Taxes" },
  { keywords: ["SUNPASS"], category: "Transportation" },
  { keywords: ["WISE", "REAL TIME TRANSFER"], category: "Transfers In" },
];

function mapBankCategory(type: string, description: string): { name: string; type: "INCOME" | "EXPENSE" } {
  const descUpper = description.toUpperCase();

  // Check description keywords first for more specific matches
  for (const rule of DESCRIPTION_KEYWORDS) {
    if (rule.keywords.some((kw) => descUpper.includes(kw))) {
      // Determine income/expense from amount sign (handled by caller)
      // but we can infer from the base type mapping
      const baseMapping = BANK_TYPE_CATEGORY[type];
      const catType = baseMapping?.type ?? "EXPENSE";

      // Payroll and Transfers In are always income
      if (rule.category === "Payroll" || rule.category === "Transfers In") {
        return { name: rule.category, type: "INCOME" };
      }
      return { name: rule.category, type: catType };
    }
  }

  // Fall back to type-based mapping
  return BANK_TYPE_CATEGORY[type] ?? { name: "Other", type: "EXPENSE" };
}

// --- CC CSV Category Mapping ---

const CC_PAYMENT_TYPES = ["Payment"];

function mapCCCategory(
  category: string,
  type: string,
  amount: number
): { name: string; type: "INCOME" | "EXPENSE" } {
  // Payments are income (money going back)
  if (CC_PAYMENT_TYPES.includes(type) || !category) {
    return { name: "Credit Card Payment", type: "INCOME" };
  }
  // Returns and positive adjustments
  if (amount > 0) {
    return { name: category || "Refund", type: "INCOME" };
  }
  return { name: category, type: "EXPENSE" };
}

// --- Row Normalization ---

function normalizeBankRow(fields: string[]): ParsedTransaction | null {
  // Details, Posting Date, Description, Amount, Type, Balance, Check or Slip #
  const [details, postingDate, description, amountStr, type] = fields;
  if (!details || !postingDate || !amountStr) return null;

  const amount = parseFloat(amountStr);
  if (isNaN(amount)) return null;

  const isIncome = amount > 0;
  const mapping = mapBankCategory(type, description);

  return {
    date: convertDate(postingDate),
    description,
    amount: Math.abs(amount),
    type: isIncome ? "INCOME" : "EXPENSE",
    categoryName: mapping.name,
    method: type || null,
  };
}

function normalizeCCRow(fields: string[]): ParsedTransaction | null {
  // Transaction Date, Post Date, Description, Category, Type, Amount, Memo
  const [txDate, , description, category, type, amountStr] = fields;
  if (!txDate || !amountStr) return null;

  const amount = parseFloat(amountStr);
  if (isNaN(amount)) return null;

  const mapping = mapCCCategory(category, type, amount);

  return {
    date: convertDate(txDate),
    description,
    amount: Math.abs(amount),
    type: mapping.type,
    categoryName: mapping.name,
    method: type || null,
  };
}

// --- Group by Category ---

function groupByCategory(transactions: ParsedTransaction[]): CategoryGroup[] {
  const map = new Map<string, CategoryGroup>();

  for (const tx of transactions) {
    const key = tx.categoryName;
    const existing = map.get(key);
    if (existing) {
      existing.count++;
      existing.total += tx.type === "INCOME" ? tx.amount : -tx.amount;
    } else {
      map.set(key, {
        name: tx.categoryName,
        type: tx.type,
        count: 1,
        total: tx.type === "INCOME" ? tx.amount : -tx.amount,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    // Income first, then by absolute total descending
    if (a.type !== b.type) return a.type === "INCOME" ? -1 : 1;
    return Math.abs(b.total) - Math.abs(a.total);
  });
}

// --- Main Parse Function ---

export function parseCSV(raw: string): ParsedCsvResult {
  const rows = parseCSVText(raw);
  if (rows.length < 2) {
    throw new Error("CSV file is empty or has no data rows.");
  }

  const headerRow = rows[0];
  const format = detectFormat(headerRow);
  const dataRows = rows.slice(1);

  const normalizer = format === "BANK" ? normalizeBankRow : normalizeCCRow;

  const transactions: ParsedTransaction[] = [];
  for (const row of dataRows) {
    const tx = normalizer(row);
    if (tx) transactions.push(tx);
  }

  if (transactions.length === 0) {
    throw new Error("No valid transactions found in the CSV file.");
  }

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryGroups = groupByCategory(transactions);

  return { format, transactions, totalIncome, totalExpense, categoryGroups };
}

// --- Merge multiple parsed results ---

export function mergeParsedResults(results: ParsedCsvResult[]): ParsedCsvResult {
  const allTransactions = results.flatMap((r) => r.transactions);
  const totalIncome = results.reduce((sum, r) => sum + r.totalIncome, 0);
  const totalExpense = results.reduce((sum, r) => sum + r.totalExpense, 0);
  const categoryGroups = groupByCategory(allTransactions);

  // Use "BANK" if any is bank, otherwise "CREDIT_CARD"
  const formats = new Set(results.map((r) => r.format));
  const format: CsvFormat = formats.size > 1 ? "BANK" : results[0]?.format ?? "BANK";

  return { format, transactions: allTransactions, totalIncome, totalExpense, categoryGroups };
}
