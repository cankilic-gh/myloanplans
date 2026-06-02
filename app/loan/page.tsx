import type { Metadata } from "next";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LoanApp } from "@/components/loan/LoanApp";

export const metadata: Metadata = {
  title: "Free Mortgage & Loan Calculator with Amortization Schedule",
  description:
    "Calculate your exact monthly payment, total interest, and full amortization schedule. Model extra payments, one-time payoffs, and see payoff date instantly. Private — data stays in your browser. Export to Excel & CSV.",
  alternates: { canonical: "/loan" },
  openGraph: {
    title: "Free Mortgage & Loan Calculator with Amortization Schedule",
    description:
      "Full amortization schedule, extra-payment payoff modeling, one-time payments per month, payoff simulator, and Excel/CSV export. Private — no signup, data never leaves your browser.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How is the monthly mortgage payment calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The monthly payment M is computed with the standard amortization formula: M = P × [i(1+i)^n] / [(1+i)^n − 1], where P is the loan principal (purchase price minus down payment), i is the monthly interest rate (annual rate ÷ 12), and n is the total number of monthly payments. MyLoanPlans runs this calculation entirely in your browser, so results are instant and private.",
      },
    },
    {
      "@type": "Question",
      name: "How do extra payments save interest?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every extra dollar you pay goes directly toward principal. A lower principal means less interest accrues the following month, which means more of your regular payment goes to principal — a snowball effect. Even a modest recurring extra payment (e.g., $200/month on a 30-year mortgage) can save tens of thousands of dollars in interest and cut years off your loan. Use the 'Recurring Extra Payment' and per-row 'Extra Payment' fields in the amortization table to model any scenario.",
      },
    },
    {
      "@type": "Question",
      name: "Is my data private and secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. MyLoanPlans runs entirely in your browser. All calculations happen locally using JavaScript, and your loan details are saved only to your browser's localStorage — no data is ever sent to a server, logged, or shared. Clear your browser storage and it's gone.",
      },
    },
    {
      "@type": "Question",
      name: "Can I export the amortization schedule to Excel or CSV?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Click the 'Export' button in the Amortization Schedule section to download the full schedule (month, payment, principal, interest, extra payment, remaining balance) as either a CSV file or an Excel-compatible XLS file. The export includes all one-time extra payments you've entered.",
      },
    },
    {
      "@type": "Question",
      name: "Can I compare multiple loan scenarios?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Use the plan switcher at the top of the calculator to create and save multiple loan plans — for example, comparing a 15-year vs. 30-year mortgage, or different interest rates. Each plan has its own inputs, amortization schedule, and payment history. Plans are persisted locally in your browser.",
      },
    },
  ],
};

export default function LoanPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteNav />
      <main className="mesh-bg min-h-screen pt-24 pb-16">
        <LoanApp />
      </main>
      <SiteFooter />
    </>
  );
}
