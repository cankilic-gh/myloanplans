import { Landing } from "@/components/landing3d/Landing";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MyLoanPlans",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "A private, no-signup mortgage and budget planner. Amortization schedules, payoff simulations, and savings projections — stored only in your browser.",
  url: "https://myloanplans.com",
  featureList: [
    "Amortization schedule",
    "Payoff simulator",
    "Extra & one-time payments",
    "Budget tracking",
    "Recurring income & expenses",
    "Compound-interest savings projection",
    "Excel / CSV export",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Landing />
    </>
  );
}
