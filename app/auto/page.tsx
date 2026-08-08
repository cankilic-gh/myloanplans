import type { Metadata } from "next";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { AutoApp } from "@/components/auto/AutoApp";

export const metadata: Metadata = {
  title: "Lease vs. Finance Car Calculator — Compare Total Cost Over Time",
  description:
    "Compare financing a car and holding it against repeated leasing over a 1–10 year horizon. Editable Tesla Model 3 example, custom depreciation curve, break-even year, and full cost breakdown. Private — data stays in your browser.",
  alternates: { canonical: "/auto" },
  openGraph: {
    title: "Lease vs. Finance Car Calculator — Compare Total Cost Over Time",
    description:
      "Model net cost, effective monthly cost, equity, and break-even year for financing vs. repeated leasing. Editable illustrative Tesla Model 3 example included. Private — no signup, data never leaves your browser.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is leasing or financing a car cheaper?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends entirely on your inputs — down payment, APR, lease payment, mileage, and how long you keep the car. This planner computes a net cost for each path (cash paid minus what you'd get back, if anything, at your horizon) so you can compare them for your own numbers, not a generic rule of thumb.",
      },
    },
    {
      "@type": "Question",
      name: "How are repeated leases modeled beyond one lease term?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If your comparison horizon is longer than one lease term, the calculator assumes you return the car and sign a new comparable lease, repeating until the horizon is reached, with each cycle's payment and fees increased by an editable escalation rate. A partial final cycle counts the due-at-signing and months actually paid, but not the disposition fee or excess-mileage charge, since the car hasn't been turned in yet.",
      },
    },
    {
      "@type": "Question",
      name: "Where does the Tesla Model 3 depreciation curve come from?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The default depreciation curve is sourced from CarEdge's published Tesla Model 3 retained-value data (baseline: $51,380 new, 13,500 miles/year), reviewed August 2026. The percentages are applied to whatever purchase price you enter as an estimate, not a guaranteed resale value, and can be fully customized in the Depreciation Curve section.",
      },
    },
    {
      "@type": "Question",
      name: "Is my data private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All calculations run locally in your browser and inputs are saved only to your browser's local storage. Nothing is sent to a server.",
      },
    },
  ],
};

export default function AutoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteNav />
      <main className="mesh-bg min-h-screen pt-24 pb-16">
        <AutoApp />
      </main>
      <SiteFooter />
    </>
  );
}
