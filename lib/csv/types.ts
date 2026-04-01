export type CsvFormat = "BANK" | "CREDIT_CARD";

export interface ParsedTransaction {
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // Always positive
  type: "INCOME" | "EXPENSE";
  categoryName: string;
  method: string | null;
}

export interface ParsedCsvResult {
  format: CsvFormat;
  transactions: ParsedTransaction[];
  totalIncome: number;
  totalExpense: number;
  categoryGroups: CategoryGroup[];
}

export interface CategoryGroup {
  name: string;
  type: "INCOME" | "EXPENSE";
  count: number;
  total: number;
}

export interface BatchCreateRequest {
  accountId: string;
  transactions: Array<{
    amount: number;
    date: string;
    categoryName: string;
    categoryType: "INCOME" | "EXPENSE";
    note: string | null;
    method: string | null;
  }>;
}

export interface BatchCreateResponse {
  created: number;
  skipped: number;
  newCategories: string[];
}
