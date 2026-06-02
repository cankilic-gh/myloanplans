import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://www.myloanplans.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MyLoanPlans — Free Mortgage Calculator & Budget Planner",
    template: "%s · MyLoanPlans",
  },
  description:
    "Free, private, no-signup mortgage & loan calculator with full amortization schedule, extra-payment planning, and a complete budget planner with savings projections. All data stays in your browser. Export to Excel & CSV.",
  applicationName: "MyLoanPlans",
  keywords: [
    "mortgage calculator",
    "loan calculator",
    "amortization schedule",
    "extra payment calculator",
    "mortgage payoff calculator",
    "budget planner",
    "budget calculator",
    "savings calculator",
    "compound interest calculator",
    "free mortgage calculator no signup",
    "biweekly mortgage calculator",
    "financial planning tool",
  ],
  authors: [{ name: "MyLoanPlans" }],
  creator: "MyLoanPlans",
  publisher: "MyLoanPlans",
  alternates: { canonical: "/" },
  category: "finance",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "MyLoanPlans",
    title: "MyLoanPlans — Free Mortgage Calculator & Budget Planner",
    description:
      "Plan your mortgage and budget in one private, no-signup app. Full amortization, extra-payment payoff, savings projections, Excel/CSV export. Your data never leaves your browser.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyLoanPlans — Free Mortgage Calculator & Budget Planner",
    description:
      "Private, no-signup mortgage + budget planner. Amortization, payoff, savings projections, Excel/CSV export.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfcfe",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "MyLoanPlans",
  url: SITE_URL,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any (Web)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Free, private mortgage & loan calculator and budget planner. Amortization schedules, extra-payment payoff, savings projections and Excel/CSV export — all stored locally in your browser with no signup.",
  featureList: [
    "Mortgage & loan amortization calculator",
    "Extra & one-time payment payoff planning",
    "Budget planner with income/expense tracking",
    "Recurring income & expenses",
    "Savings goals with compound-interest projection",
    "Monthly & yearly cash-flow projection",
    "Excel (XLS) and CSV export",
    "No signup — data stays in your browser",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

        <Script
          id="ld-json"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SG8PGWYZBT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SG8PGWYZBT');
          `}
        </Script>
      </body>
    </html>
  );
}
