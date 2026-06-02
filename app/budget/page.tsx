import type { Metadata } from "next";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BudgetApp } from "@/components/budget2/BudgetApp";

// ---- Metadata ----

export const metadata: Metadata = {
  title: "Free Budget Planner with Savings & Cash-Flow Projections",
  description:
    "Track income and expenses, set recurring items, build savings goals with compound-interest projections, view 12-month and yearly cash flow, import Chase CSV, and export to Excel or CSV — fully private, no account required.",
  alternates: { canonical: "/budget" },
  openGraph: {
    title: "Free Budget Planner with Savings & Cash-Flow Projections",
    description:
      "Private, no-signup budget tool. Recurring income/expense tracking, compound savings projections, monthly cash flow, Chase CSV import, Excel export. All data stays in your browser.",
    url: "/budget",
    type: "website",
  },
};

// ---- FAQ JSON-LD ----

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does the savings projection work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each savings goal uses monthly compound interest. Your starting balance plus any extra one-off contributions earns interest each month at (annual rate / 12). Monthly deposits are added before each compounding step, giving you an accurate year-by-year projection of your balance.",
      },
    },
    {
      "@type": "Question",
      name: "What CSV files are supported for import?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The importer supports Chase Bank checking/savings account statements and Chase Credit Card statements. It auto-detects the format from the CSV header row and maps transactions to income or expense categories automatically.",
      },
    },
    {
      "@type": "Question",
      name: "Is my financial data private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — completely. All data is stored exclusively in your browser's localStorage. No account, no server, no cloud sync. If you clear your browser cache the data is gone. Nothing is transmitted to any server.",
      },
    },
    {
      "@type": "Question",
      name: "Can I export my budget data to Excel?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Both the monthly cash-flow projection table and the transactions list can be exported as Excel (.xls) or CSV files using the Export button. The Excel file uses SpreadsheetML format and opens natively in Excel, Numbers, and Google Sheets.",
      },
    },
    {
      "@type": "Question",
      name: "What is a recurring item and how does it affect the projection?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Recurring items are income sources or expenses that repeat on a fixed schedule (biweekly, monthly, every 6 months, or yearly). The planner converts each item to its monthly equivalent and uses it to build a 12-month cash-flow forecast, letting you see your running balance for any month of any year.",
      },
    },
  ],
};

// ---- Page ----

export default function BudgetPage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <SiteNav />

      <main className="mesh-bg min-h-screen pt-24 pb-12">
        <BudgetApp />
      </main>

      <SiteFooter />
    </>
  );
}
